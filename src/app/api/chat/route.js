import { NextResponse } from 'next/server';
import { GraphCypherQAChain } from "@langchain/community/chains/graph_qa/cypher";
import { AzureChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from "@langchain/core/prompts";
import neo4j from 'neo4j-driver';

export async function POST(req) {
  const { messages } = await req.json();
  const question = messages.filter(m => m.role === 'user').pop()?.content;
  if (!question) return new NextResponse('No user message', { status: 400 });

  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );

  const runRead = async (cypher) => {
    const session = driver.session({ defaultAccessMode: neo4j.session.READ });
    try {
      const res = await session.run(cypher);
      return res.records.map(r => r.toObject());
    } finally {
      await session.close();
    }
  };

  const graph = {
    query: runRead,
    getSchema: async () =>
      runRead('CALL db.schema.visualization()').then(recs => ({
        nodes: recs.flatMap(r => r.nodes),
        relationships: recs.flatMap(r => r.relationships),
      })),
  };

  const CYPHER_GENERATION_TEMPLATE_FALLBACK = `
  Task: Generate a cypher query that retrieves full nodes…

  Schema:
  {schema}

  # FIELD-MAPPING TABLE
  | natural-language concept | graph property   |
  | ------------------------ | ---------------- |
  | gene name                | gene       |
  | biotype                  | biotype    |
  | synonyms                 | Synonyms   |
  | fold change              | Fold_change |
  | description              | description |

  # EDGE TITLES
  - belongs_to
  - HAS_GO_BP
  - HAS_PATHWAY

  Return the entire node.

  The question is:
  {question}
 `;

  const CYPHER_GENERATION_TEMPLATE = `
  Task: Generate a cypher query that retrieves full nodes…

  Schema:
  {schema}

  ## Node Types & Their Properties

  ### Dataset
  - pid (string)  
  - title (string)  
  - description (string)  

  ### Gene
  - pid (string)  
  - gene (string)  
  - gene_id (string)  
  - biotype (string)  
  - strand (string)  
  - locus (string)  
  - GroupA_FPKM (float)  
  - GroupB_FPKM (float)  
  - Fold_change (float)  
  - log2_fold_change (float)  
  - p_value (float)  
  - FDR (float)  
  - Regulation (string)  
  - GeneID (string)  
  - Synonyms (string)  
  - dbXrefs (string)  
  - chromosome (string)  
  - map_location (string)  
  - description (string)  
  - pathway (string)  
  - GO_CC (string)  
  - GO_MF (string)  
  - GO_BP (string)  

  ### GO_BP
  - pid (string)  
  - name (string)  

  ### Pathway
  - pid (string)  
  - name (string)  

  ## Relationship Types

  cypher
  (:Gene)-[:belongs_to]->(:Dataset)
  (:GO_BP)-[:belongs_to]->(:Dataset)
  (:Pathway)-[:belongs_to]->(:Dataset)
  (:Gene)-[:HAS_GO_BP]->(:GO_BP)
  (:Gene)-[:HAS_PATHWAY]->(:Pathway)

  
  Return the entire node.

  The question is:
  {question}
  `;

  const llm = new AzureChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
    temperature: 0,
    model: 'gpt-4o-mini',
  });

  async function runGraphQA(promptTemplate) {
    const chain = GraphCypherQAChain.fromLLM({
      llm,
      graph,
      cypherPrompt: promptTemplate,
      verbose: true,
      allowDangerousRequests: true,
      returnIntermediateSteps: true,
      returnDirect: false,
    });
    return chain.invoke({ query: question, returnIntermediateSteps: true });
  }

  try {
    // First attempt with primary template
    console.log('Running initial Cypher generation');
    let { result: answer, intermediateSteps } = await runGraphQA(
      new PromptTemplate({ template: CYPHER_GENERATION_TEMPLATE, inputVariables: ["schema", "question"] })
    );

    let nodeData = intermediateSteps?.[1]?.context || [];
    console.log('Final Answer:', answer);
    console.log('Cypher Query:', intermediateSteps?.[0]);
    console.log('Node Data:', nodeData);

    const shouldFallback = /don't know/i.test(answer) || nodeData.length === 0;
    if (shouldFallback) {
      console.warn('⚠️ No results, retrying with fallback template');
      ({ result: answer, intermediateSteps } = await runGraphQA(
        new PromptTemplate({ template: CYPHER_GENERATION_TEMPLATE, inputVariables: ["schema", "question"] })
      ));
      nodeData = intermediateSteps?.[1]?.context || [];
      console.log('Fallback Answer:', answer);
      console.log('Fallback Cypher:', intermediateSteps?.[0]);
      console.log('Fallback Nodes:', nodeData);
    }

    // Unpack nodes
    const unpacked = nodeData.map(record => {
      const node = record.g ?? record.n ?? record.p ?? Object.values(record).find(v => v?.identity);
      const rawId = node.identity;
      const id = typeof rawId.toInt === 'function' ? rawId.toInt() : rawId;
      return { id, labels: node.labels, elementId: node.elementId, properties: node.properties };
    });

    return NextResponse.json({
      reply: {
        role: 'assistant',
        content: answer,
        context: { cypher: intermediateSteps?.[0], nodeData: unpacked }
      }
    });

  } catch (e) {
    console.error('Graph QA error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    await driver.close();
  }
}

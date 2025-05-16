import { NextResponse } from 'next/server';
import { GraphCypherQAChain } from 'langchain/chains/graph_qa/cypher';
import { AzureChatOpenAI } from '@langchain/openai';
import neo4j from 'neo4j-driver';

export async function POST(req) {
  const { messages } = await req.json();
  const question = messages.filter(m => m.role === 'user').pop()?.content;
  if (!question) return new NextResponse('No user message', { status: 400 });

  /* One driver per server process */
  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );

  /* Opens its *own* session every time */
  const runRead = async (cypher) => {
    const session = driver.session({ defaultAccessMode: neo4j.session.READ });
    try {
      const res = await session.run(cypher);
      return res.records.map(r => r.toObject());
    } finally {
      await session.close(); 
    }
  };

  /* Graph wrapper that GraphCypherQAChain expects */
  const graph = {
    query: runRead,
    getSchema: async () =>
      runRead('CALL db.schema.visualization()').then(recs => ({
        nodes: recs.flatMap(r => r.nodes),
        relationships: recs.flatMap(r => r.relationships),
      })),
  };

  /* Azure OpenAI LLM */
  const llm = new AzureChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
    temperature: 0,
    model: 'gpt-4o-mini',
  });

  try {
    const chain = GraphCypherQAChain.fromLLM({ llm, graph });
    const { result } = await chain.invoke({ query: question });
    return NextResponse.json({ reply: { role: 'assistant', content: result } });
  } catch (e) {
    console.error('Graph QA error:', e);
    return new NextResponse('Internal Error: ' + e.message, { status: 500 });
  } finally {
    await driver.close();
  }
}

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

  const CYPHER_GENERATION_TEMPLATE_TABLE_MODULE = `
  Task: Generate a cypher query that retrieves full nodes…

  Schema:
  {schema}

  ## Node Types & Their Properties

  ### Gene Properties
  gene_id_ontology_link,
  p_value_ontology_term,
  map_location,
  description_ontology_link,
  Synonyms,
  biotype_ontology_link,
  gene,
  Regulation_ontology_name,
  pathway_ontology_term,
  GeneID_ontology_name,
  map_location_ontology_link,
  pathway_ontology_name,
  gene_ontology_name,
  GroupB_FPKM_ontology_term,
  Regulation_ontology_term,
  locus_ontology_link,
  Synonyms_ontology_link,
  FDR,
  chromosome_ontology_link,
  gene_ontology_term,
  GeneID_ontology_link,
  GO-BP,
  p_value,
  GroupB_FPKM_ontology_name,
  GO-CC,
  Fold_change_ontology_term,
  p_value_ontology_name,
  pathway,
  strand_ontology_term,
  map_location_ontology_term,
  $schema,
  pathway_ontology_link,
  pid,
  log2(fold_change),
  biotype_ontology_term,
  description_ontology_term,
  Fold_change_ontology_name,
  GO-MF,
  gene_id_ontology_term,
  strand_ontology_name,
  map_location_ontology_name,
  gene_ontology_link,
  description_ontology_name,
  GroupA_FPKM,
  biotype_ontology_name,
  locus_ontology_term,
  gene_id,
  GeneID_ontology_term,
  GroupB_FPKM,
  chromosome_ontology_name,
  description,
  title,
  GroupB_FPKM_ontology_link,
  strand,
  Regulation_ontology_link,
  Synonyms_ontology_name,
  locus_ontology_name,
  biotype,
  Fold_change_ontology_link,
  Synonyms_ontology_term,
  strand_ontology_link,
  chromosome,
  p_value_ontology_link,
  chromosome_ontology_term,
  dbXrefs,
  Fold_change,
  gene_id_ontology_name,
  Regulation,
  GeneID,
  locus,  

  ### GO_BP Properties
  $schema,
  description,
  pid,
  title,
  GO-BP,

  ### Pathway Properties
  $schema,
  description,
  pathway_ontology_link,
  pid,
  title,
  pathway_ontology_term,
  pathway,
  pathway_ontology_name,

  ### Dataset Properties
  metadata_Series_contact_phone
  metadata_Series_platform_id
  metadata_Series_sample_taxid
  metadata_Series_contact_city
  metadata_Series_platform_taxid
  $schema
  metadata_Series_pubmed_id
  metadata_Series_relation 
  description
  metadata_Series_sample_id
  pid
  metadata_Series_geo_accession
  metadata_Series_contact_address
  title
  metadata_Series_platform_organism
  metadata_Series_summary
  metadata_Series_contact_zip/postal_code
  metadata_Series_supplementary_file
  metadata_Series_contact_name
  metadata_Series_contact_institute
  metadata_Series_contact_country
  metadata_Series_submission_date
  metadata_Series_typ
  metadata_Series_last_update_date5"
  metadata_Series_sample_organism
  metadata_Series_title
  metadata_Series_status
  metadata_Series_overall_design
  metadata_Series_contact_email
  metadata_Series_contact_state

 ## Metadata (Pathway, GO_BP and Gene nodes share these properties!)
  metadata_pid,metadata_library_strategy,metadata_sample_ids,
  metadata_channel_count: 1metadata_molecule_ch1,metadata_contact_zip_postal_code,metadata_last_update_date,metadata_geo_accessions,metadata_submission_date,metadata_contact_name,metadata_series_id,
  metadata_taxid_ch1: 9606metadata_library_source,metadata_titles,metadata_extract_protocol_ch1,metadata_organism_ch1,metadata_status,metadata_contact_institute,metadata_contact_country,metadata_library_selection,metadata_contact_phone,metadata_type,metadata_data_processing,metadata_source_name_ch1,metadata_contact_state,metadata_characteristics_ch1,metadata_contact_email,metadata_platform_id,metadata_instrument_model,
  metadata_data_row_count: 0metadata_contact_address,metadata_contact_city,

  ## Relationship Types

  cypher
  (:Gene)-[:HAS_GO_BP]->(:GO_BP)
  (:Gene)-[:HAS_PATHWAY]->(:Pathway)

  
  Return the entire node, not only a term.

  The question is:
  {question}
  `;

  const EXAMPLE_CYPHER_GENERATION_TEMPLATE = `
  Task: Generate a cypher query that retrieves full nodes…

  Schema:
  {schema}

  ## Node Types & Their Properties


  ## Metadata (all nodes share this metadata as properties!)
  metadata_pid,metadata_library_strategy,metadata_sample_ids,
  metadata_channel_count: 1metadata_molecule_ch1,metadata_contact_zip_postal_code,metadata_last_update_date,metadata_geo_accessions,metadata_submission_date,metadata_contact_name,metadata_series_id,
  metadata_taxid_ch1: 9606metadata_library_source,metadata_titles,metadata_extract_protocol_ch1,metadata_organism_ch1,metadata_status,metadata_contact_institute,metadata_contact_country,metadata_library_selection,metadata_contact_phone,metadata_type,metadata_data_processing,metadata_source_name_ch1,metadata_contact_state,metadata_characteristics_ch1,metadata_contact_email,metadata_platform_id,metadata_instrument_model,
  metadata_data_row_count: 0metadata_contact_address,metadata_contact_city,

  ### Pathway Properties
  $schema: "http://json-schema.org/draft-07/schema#"
  description: "Information related to pathway"
  pathway_ontology_link: "https://data.bioont23C54214"
  pid:
  title: "pathway"
  pathway_ontology_term: "Pathway"
  pathway: "hsa04380(Osteoclast differentiation)"
  pathway_ontology_name: "NCIT"

  ### Dataset Properties
  metadata_Series_contact_phone: "17839914360"
  metadata_Series_platform_id: "GPL20301"
  metadata_Series_sample_taxid: "9606"
  metadata_Series_contact_city: "Beijing"
  metadata_Series_platform_taxid: "9606"
  $schema: "http://json-schema.org/draft-07/schema#"
  metadata_Series_pubmed_id: "39717085"
  metadata_Series_relation: "BioProject: https://www.ncbi.nlm.nih.gov/bioproject/PRJNA1180550"
  description: "Study object (such as patient, gene or cell) related information"
  metadata_Series_sample_id: ["GSM8605905", "GSM8605906", "GSM8605907", "GSM8605908", "GSM8605909", "GSM8605910", "GSM8605911", "GSM8605912"]
  pid: "10.5281/zenodo.286719"
  metadata_Series_geo_accession: "GSE280797"
  metadata_Series_contact_address: "No.52 Fucheng Road, Haidian District"
  title: "Dataset"
  metadata_Series_platform_organism: "Homo sapiens"
  metadata_Series_summary: "The efficacy of hepatic arterial infusion chemotherapy (HAIC) with oxaliplatin (OXA) and 5-fluorouracil (5-Fu) for treating advanced perihilar cholangiocarcinoma (pCCA) has been demonstrated, yet the survival benefits of HAIC for pCCA patients vary. Here, we aimed to screen out HAIC resistance-related bile microRNAs (miRNAs) and explore the functions of specific bile miRNAs in pCCA based on high-throughput sequencing. Levels of bile miR-532-3p,miR-1250-5p, and miR-4772-5p were related to the survival of advanced pCCA patients after HAIC. However, only overexpression of miR-532-3p promoted OXA/5-Fu resistance, and downregulation of its expression improved sensitivity to OXA/5-Fu. Mechanistic investigations revealed secreted protein acidic and rich in cysteine (SPARC) as the direct target of miR-532-3p. Our study reveals that bile miR-532-3p, miR-1250-5p, and miR-4772-5p may serve as survival biomarkers in advanced pCCA patients after HAIC and that bile miR-532-3p promotes resistance to HAIC with OXA and 5-Fu via negatively regulating SPARC expression."
  metadata_Series_contact_zip/postal_code: "100142"
  metadata_Series_supplementary_file: "ftp://ftp.ncbi.nlm.nih.gov/geo/series/GSE280nnn/GSE280797/suppl/GSE280797_Processed_data.xlsx"
  metadata_Series_contact_name: "Haizhen Du"
  metadata_Series_contact_institute: "Peking University Cancer Hospital and Institute"
  metadata_Series_contact_country: "China"
  metadata_Series_submission_date: "Oct 31 2024"
  metadata_Series_type: "Expression profiling by high throughput sequencing"
  metadata_Series_last_update_date: "Jan 30 2025"
  metadata_Series_sample_organism: "Homo sapiens"
  metadata_Series_title: "Screening and molecular mechanism research on bile microRNAs associated with chemotherapy efficacy in perihilar cholangiocarcinoma"
  metadata_Series_status: "Public on Nov 02 2024"
  metadata_Series_overall_design: "A retrospective review of the Hospital Information System identified a total of 31 advanced pCCA patients who received first-line HAIC treatment from June 2015 to June 2016 at our center, of which bile samples were obtained from 18 patients prior to HAIC treatment. According to the complete survival follow-up, all of the patients died, with the following survival distribution: OS < 6 months, n = 7; OS between 6 months and 12 months, n = 4; and OS > 12 months, n = 7. We ultimately selected the bile samples of four patients among the seven with better prognosis (OS > 12 months; group A) and four patients among the seven with dismal prognosis (OS < 6 months; group B) from the biobank according to the patients’ baseline characteristics and results of RNA quality control. The bile samples (15 mL) were obtained by percutaneous transhepatic cholangial drainage (PTCD) within 7 days before the first cycle of the HAIC procedure. Centrifugation of the fresh bile at 2,000 rpm for 10 minutes yielded a supernatant, which was then stored in a freezer at −80°C. Patients signed informed consent forms for clinical specimen collection prior to PTCD. The sequencing of mRNAs was performed by CloudSeq Biotech Inc. (Shanghai, China). After removing rRNA, a NEBNext® Ultra™ II Directional RNA Library Prep Kit (New England Biolabs, Inc., MA, USA) was used to construct RNA libraries. High-throughput sequencing was performed using an Illumina HiSeq instrument. Differentially expressed mRNAs were filtered by |Fold change| ≥ 2.0 and P value < 0.05. Finally, Gene Ontology (GO) and pathway enrichment analyses were also performed for differentially expressed mRNAs."
  metadata_Series_contact_email: "2111110621@stu.pku.edu.cn"
  metadata_Series_contact_state: "Beijing"

  ### Gene Properties
  map_location: "7q21.3"
  Synonyms: "CRT|CT-R|CTR|CTR1"
  gene: "CALCR"
  FDR: "1"
  GO-BP: "GO:0007189(adenylate cyclase-activating G-protein coupled receptor signaling pathway)//GO:0007186(G-p)"
  p_value: "1"
  GO-CC: "GO:0005886(plasma membrane)//GO:0005929(cilium)//GO:0016020(membrane)"
  pathway: "hsa04080(Neuroactive ligand-receptor interaction)//hsa04380(Osteoclast differentiation)"
  $schema: "http://json-schema.org/draft-07/schema#"
  pid: "juMqrMK6tXim2LrD64Sko5"
  log2(fold_change): "2.05017"
  GO-MF: "GO:0004872(receptor activity)//GO:0032841(calcitonin binding)"
  GroupA_FPKM: "0.279722"
  gene_id: "ENSG00000004948"
  GroupB_FPKM: "1.15848"
  description: "calcitonin receptor"
  title: "Gene"
  strand: "-"
  biotype: "protein_coding"
  chromosome: "7"
  dbXrefs: "MIM:114131|HGNC:HGNC:1440|Ensembl:ENSG00000004948|HPRD:00239|Vega:OTTHUMG00000023599"
  Fold_change: "4.14154768597"
  Regulation: "up"
  GeneID: "799"
  locus: "chr7:93053798-93204042"


  ### GO_BP Properties
  $schema
  description: "Information related to GO-BP"
  pid
  title: "GO-BP"
  GO-BP: "GO:0030326(embryonic limb morphogenesis)"
  ## Relationship Types

  cypher
  (:Gene)-[:HAS_GO_BP]->(:GO_BP)
  (:Gene)-[:HAS_PATHWAY]->(:Pathway)

  
  Return the entire node.

  The question is:
  {question}
  `;


  const CYPHER_GENERATION_TEMPLATE_TABLE_MODULE_Non_FAIR = `
  Task: Generate a cypher query that retrieves full nodes…

  Schema:
  {schema}

  ## Node Types & Their Properties

  ### Pathway properties
  $schema,
  node_key,
  __key,
  pathway,
  description,
  title,

  ### Dataset properties
  $schema,
  node_key,
  description,
  title,

  ### Gene properties
  $schema,
  GroupB_FPKM,
  description,
  log2(fold_change),
  title,
  GO-MF,
  strand,
  FDR,
  node_key,
  __key,
  map_location,
  GO-BP,
  Synonyms,
  p_value,
  biotype,
  gene,
  chromosome,
  GO-CC,
  dbXrefs,
  GroupA_FPKM,
  Fold_change,
  pathway,
  Regulation,
  GeneID,
  locus,
  gene_id,

  ### GO_BP properties
  $schema,
  node_key,
  __key,
  description,
  title,
  GO-BP,

  ## Relationship Types

  cypher
  (:Gene)-[:HAS_GO_BP]->(:GO_BP)
  (:Gene)-[:HAS_PATHWAY]->(:Pathway)

  
  Return the entire node.

  The question is:
  {question}
  `;

  const TEXT_MODULE = `
    Task: Generate a cypher query that retrieves full nodes…

    Schema:
    {schema}

    ## Node Types & Their Properties keys

    Ontology properties (each key/property has an ontology term, ontology name and  ontology link modeled as separate property/key)

    {{property key}}_ontology_term
    {{property key}}_ontology_name
    {{property key}}_ontology_link


    Report property keys

    $schema
    title: "Report {{number}}"
    immunohistochemical_tests_value
    clinical_information_value 
    pid 
    comment_value 
    tumor_localization_code_value 
    additional_findings_value 
    description
    short_histological_findings_value
    quality_assurance
    summary_microscopic_assessment_value 
    tumor_histology_code_value 
    macroscopy_value
    findings
    material_type
    clinical_indications
    short_histological_findings
    macroscopy
    diagnosis_summary
    tumor_localization_code
    tumor_histology_code
    quality_assurance
    additional_findings
    patient_name


    Diagnosis Properties keys

    $schema 
    description 
    pid 
    title 
    summary_microscopic_assessment_value 


    Test Properties keys

    $schema 
    immunohistochemical_tests_value 
    description 
    pid 
    title 

  
    Specimen Properties keys

    $schema
    description 
    pid 
    title 


    Test Results keys
    $schema 
    description 
    pid 
    title 
     

    All nodes share the following metadata
    metadata_pid 
    metadata_moddate 
    metadata_creationdate 
    metadata_creator 
    metadata_source 
    metadata_total_pages 
    metadata_page 
    metadata_producer


    Relationship (All nodes from the same document are connected with this relationship)
    belongs_to_same_doc_as (200)

    similar_additional_findings (2)
    similar_clinical_information (6)
    similar_comment (36)
    similar_her2neu_results (2)
    similar_hormone_receptor_results (2)
    similar_immunohistochemical_tests (68)
    similar_macroscopy (42)
    similar_patient_name (20)
    similar_primary_tumor_localization (50)
    similar_report_date (80)
    similar_report_number (20)
    similar_short_histological_findings (2)
    similar_summary_microscopic_assessment (276)
    similar_tumor_histology_code (132)
    similar_tumor_localization_code (142)

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
      new PromptTemplate({ template: CYPHER_GENERATION_TEMPLATE_TABLE_MODULE, inputVariables: ["schema", "question"] })
    );

    let nodeData = intermediateSteps?.[1]?.context || [];
    console.log('Final Answer:', answer);
    console.log('Cypher Query:', intermediateSteps?.[0]);
    console.log('Node Data:', nodeData);

    //const shouldFallback = /don't know/i.test(answer) || nodeData.length === 0;
    const shouldFallback = false
    if (shouldFallback) {
      console.warn('⚠️ No results, retrying with fallback template');
      ({ result: answer, intermediateSteps } = await runGraphQA(
        new PromptTemplate({ template: CYPHER_GENERATION_TEMPLATE_TABLE_MODULE, inputVariables: ["schema", "question"] })
      ));
      nodeData = intermediateSteps?.[1]?.context || [];
      console.log('Fallback Answer:', answer);
      console.log('Fallback Cypher:', intermediateSteps?.[0]);
      console.log('Fallback Nodes:', nodeData);
    }

    // Unpack nodes
    let unpacked = nodeData.map(record => {
      const node = record.g ?? record.n ?? record.p ?? Object.values(record).find(v => v?.identity);
      if (!node) {
        return record
      }
      const rawId = node.identity;
      const id = typeof rawId.toInt === 'function' ? rawId.toInt() : rawId;
      return { id, labels: node.labels, elementId: node.elementId, properties: node.properties };
    }).filter(Boolean);

    console.log(unpacked)

    return NextResponse.json({
      reply: {
        role: 'assistant',
        content: answer,
        context: { cypher: intermediateSteps?.[0], nodeData: unpacked, nonNodeData: nodeData }
      }
    });

  } catch (e) {
    console.error('Graph QA error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    await driver.close();
  }
}

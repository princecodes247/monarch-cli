import { ensureDir, writeFile, writeFileSync } from "fs-extra";
import path from "path";
import { capitalize, getFieldType, mergeFieldTypes } from "./lib/utils";
import { Collection, Db, ObjectId } from "mongodb";


function generateSchemaFromSample(collectionName: string, inferredSchema: Record<string, any>): string {

    const fields = Object.keys(inferredSchema).map((key) => {
      const fieldType = inferredSchema[key];
      return `  ${key}: ${fieldType},`;
    });
  
    const importStatements = generateImports();
    const schemaName = capitalize(collectionName);
  
    return `${importStatements}const ${schemaName}Schema = createSchema("${collectionName}", {\n${fields.join('\n')}\n});\n
  export type I${schemaName} = InferSchemaOutput<typeof ${schemaName}Schema>;\n`;
  }
  

  const usedTypes = new Set<string>();


  async function inferSchemaFromCollection(collection: Collection, sampleSize: number): Promise<Record<string, any>> {
    const sampleDocuments = await collection.find({}).limit(sampleSize).toArray();
    
    if (sampleDocuments.length === 0) {
      console.log(`Collection "${collection.collectionName}" is empty`);
      return {}
    }
    const schema: Record<string, string> = {};
    // Aggregate field types from all documents
    sampleDocuments.forEach(doc => {
      Object.keys(doc).forEach(key => {
        schema[key] = getFieldType(doc[key], usedTypes)
      });
    });
    return schema;
  }

  function generateImports(): string {
    const imports = Array.from(usedTypes).sort().join(', ');
    return `import { ${imports} } from "monarch-orm";\n\n`;
  }

  export async function generateSchemas(db: Db, output: string, sampleSize: number = 10) {
    try {
      const collections = await db.listCollections().toArray();
      const outputDir = path.resolve(output);
  
      await ensureDir(outputDir);
      console.log(`Generating schemas in ${outputDir}...`);
  
      for (const collectionInfo of collections) {
        const collection = db.collection(collectionInfo.name);
        usedTypes.clear(); // Clear used types for each new schema generation
        usedTypes.add("createSchema")
        usedTypes.add("InferSchemaOutput")
        const inferredSchema = await inferSchemaFromCollection(collection, sampleSize);
        const schemaCode = generateSchemaFromSample(collection.collectionName, inferredSchema);
  
       // Write the schema to file
       const schemaFilePath = path.join(output, `${collection.collectionName}.schema.ts`);
          
          await writeFile(schemaFilePath, schemaCode)
        //   console.log(chalk.green(`Schema generated for ${collection.name}: ${filePath}`));
          console.log(`Schema generated for ${collection.collectionName}: ${schemaFilePath}`);
        
      }
    } catch (err) {
      console.error('Error introspecting database:', err);
      process.exit(1);
    }
  }
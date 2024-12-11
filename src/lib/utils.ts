import { ObjectId } from "mongodb";

export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


 export function mergeFieldTypes(existingType: string | null, newValue: any, usedTypes: Set<String>): string {
    const newType = getFieldType(newValue, usedTypes);
    if (!existingType) return newType;
    
    // if (existingType !== newType) {
    //   // Handle different types for the same field, e.g., string | number
    //   return `${existingType}.or(${newType})`;
    // }
    return existingType;
  }

    
 // Infer field types with special handling for arrays, objects, and ObjectId
 export function getFieldType(value: any, usedTypes: Set<String>, options?: {
  default?: unknown;
  optional?: boolean;
 }): string {
  console.log({default: options?.default})
    const modifier = `${options?.optional ? ".optional()" : ""}${options?.default ? ".default(" + options?.default + ")" : ""}`;
    if (value === null || value === undefined) {
      usedTypes.add('string');
      return "string().optional()"; // Default to string when unknown
    }
  
    if (typeof value === 'string') {
      usedTypes.add('string');
      return `string()${modifier}`;
    }
    if (typeof value === 'number') {
      usedTypes.add('number');
      return `number()${modifier}`;
    }
    if (typeof value === 'boolean') {
      usedTypes.add('boolean');
      return `boolean().default(false)${modifier}`;
    }
    if (value instanceof Date) {
      usedTypes.add('date');
      return `date()${modifier}`;
    }
    if (value instanceof ObjectId) {
      usedTypes.add('objectId');
      return `objectId()${modifier}`;
    }
  
    if (Array.isArray(value)) {
      usedTypes.add('array');
      let elementType = 'mixed()'
      if(value.length > 0) {
        elementType = getFieldType(value[0], usedTypes);
      } else {
      usedTypes.add('mixed');
      }
      return `array(${elementType})${modifier}`;
    }
  
    if (typeof value === 'object' && value !== null) {
      usedTypes.add('object');
      const properties = Object.keys(value).map((key) => {
        const propType = getFieldType(value[key], usedTypes);
        return `    ${key}: ${propType},`;
      }).join('\n');
      return `object({\n${properties}\n  })${modifier}`;
    }
  
    usedTypes.add('mixed');
    return `mixed()${modifier}`;
  }
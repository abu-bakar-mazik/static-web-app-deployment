
export function isDefinedNonEmptyString(value: any): boolean {
    return typeof value === 'string' && value.trim().length > 0;
  }
  
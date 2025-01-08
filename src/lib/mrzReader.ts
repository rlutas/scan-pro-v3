export interface MRZData {
  documentType: string;
  countryCode: string;
  documentNumber: string;
  surname: string;
  givenNames: string;
  nationality: string;
  dateOfBirth: string;
  sex: string;
  expiryDate: string;
  personalNumber: string;
  verified: boolean;
}

export class MRZReader {
  parseMRZ(text: string): MRZData | null {
    try {
      // Clean and normalize the text
      const lines = text
        .toUpperCase()
        .split(/[\n\r]+/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

      // Find MRZ lines (36 characters each for Romanian ID)
      const mrzLines = lines.filter(line => {
        const alphanumericRatio = (line.match(/[A-Z0-9<]/g) || []).length / line.length;
        return alphanumericRatio > 0.8 && line.length >= 36;
      });

      if (mrzLines.length < 2) {
        console.warn('Could not find valid MRZ lines');
        return null;
      }

      const [line1, line2] = mrzLines;

      // Parse first line: IDROUNUME<FAMILIE<<PRENUME<<<<<<<<<<<<
      const documentType = line1.substring(0, 2);
      const countryCode = line1.substring(2, 5);
      
      // Extract full name parts (positions 5-36 for Romanian ID)
      const fullNamePart = line1.substring(5);
      const nameParts = fullNamePart.split('<<').map(part => part.replace(/</g, ' ').trim());
      
      // First part is family name (everything before first '<<')
      const surname = nameParts[0];
      // Second part is given names (everything after first '<<')
      const givenNames = nameParts[1] || '';

      // Parse second line: AR123456<2ROU0101011M210101510101117
      const documentNumber = line2.substring(0, 9).replace(/<$/, '');
      const nationality = line2.substring(10, 13);
      const dateOfBirth = this.formatDate(line2.substring(13, 19));
      const sex = line2.charAt(20);
      const expiryDate = this.formatDate(line2.substring(21, 27));
      const personalNumber = line2.substring(28, 35);

      // Validate the format
      const isValidFormat = 
        documentType === 'ID' && 
        countryCode === 'ROU' &&
        line1.length === 36 && 
        line2.length === 36;

      return {
        documentType,
        countryCode,
        documentNumber,
        surname,
        givenNames,
        nationality,
        dateOfBirth,
        sex,
        expiryDate,
        personalNumber,
        verified: isValidFormat
      };
    } catch (error) {
      console.warn('Error parsing MRZ:', error);
      return null;
    }
  }

  private formatDate(date: string): string {
    if (!date || date.length !== 6) return '';
    const year = date.substring(0, 2);
    const month = date.substring(2, 4);
    const day = date.substring(4, 6);
    const fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`;
    return `${day}.${month}.${fullYear}`;
  }
} 
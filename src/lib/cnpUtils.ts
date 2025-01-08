export class CNPValidator {
  private static CONTROL_KEY = "279146358279";
  private static COUNTY_CODES: { [key: string]: string } = {
    '01': 'Alba', '02': 'Arad', '03': 'Argeș', '04': 'Bacău',
    '05': 'Bihor', '06': 'Bistrița-Năsăud', '07': 'Botoșani',
    '08': 'Brașov', '09': 'Brăila', '10': 'Buzău',
    '11': 'Caraș-Severin', '12': 'Cluj', '13': 'Constanța',
    '14': 'Covasna', '15': 'Dâmbovița', '16': 'Dolj',
    '17': 'Galați', '18': 'Gorj', '19': 'Harghita',
    '20': 'Hunedoara', '21': 'Ialomița', '22': 'Iași',
    '23': 'Ilfov', '24': 'Maramureș', '25': 'Mehedinți',
    '26': 'Mureș', '27': 'Neamț', '28': 'Olt',
    '29': 'Prahova', '30': 'Satu Mare', '31': 'Sălaj',
    '32': 'Sibiu', '33': 'Suceava', '34': 'Teleorman',
    '35': 'Timiș', '36': 'Tulcea', '37': 'Vaslui',
    '38': 'Vâlcea', '39': 'Vrancea', '40': 'București',
    '41': 'București S1', '42': 'București S2', '43': 'București S3',
    '44': 'București S4', '45': 'București S5', '46': 'București S6',
    '51': 'Călărași', '52': 'Giurgiu'
  };

  static validate(cnp: string): boolean {
    if (!/^\d{13}$/.test(cnp)) return false;

    // Extract components
    const genderCode = parseInt(cnp[0]);
    const year = parseInt(cnp.substring(1, 3));
    const month = parseInt(cnp.substring(3, 5));
    const day = parseInt(cnp.substring(5, 7));
    const county = cnp.substring(7, 9);

    // Validate gender code
    if (![1, 2, 3, 4, 5, 6, 7, 8].includes(genderCode)) return false;

    // Validate month
    if (month < 1 || month > 12) return false;

    // Validate day
    if (day < 1 || day > 31) return false;

    // Validate county code
    if (!this.COUNTY_CODES[county]) return false;

    // Calculate control digit
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnp[i]) * parseInt(this.CONTROL_KEY[i]);
    }
    const control = sum % 11;
    const controlDigit = control === 10 ? 1 : control;

    return controlDigit === parseInt(cnp[12]);
  }

  static extractInfo(cnp: string): {
    gender: string;
    dateOfBirth: string;
    age: number;
    county: string;
    isValid: boolean;
  } | null {
    if (!this.validate(cnp)) return null;

    const genderCode = parseInt(cnp[0]);
    const year = parseInt(cnp.substring(1, 3));
    const month = parseInt(cnp.substring(3, 5));
    const day = parseInt(cnp.substring(5, 7));
    const countyCode = cnp.substring(7, 9);

    // Calculate full year based on gender code
    let fullYear: number;
    switch (genderCode) {
      case 1:
      case 2:
        fullYear = 1900 + year;
        break;
      case 3:
      case 4:
        fullYear = 1800 + year;
        break;
      case 5:
      case 6:
        fullYear = 2000 + year;
        break;
      case 7:
      case 8:
        fullYear = 2000 + year; // For residents
        break;
      default:
        return null;
    }

    // Format date of birth
    const dateOfBirth = `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${fullYear}`;

    // Calculate age
    const today = new Date();
    const birthDate = new Date(fullYear, month - 1, day);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Determine gender
    const gender = genderCode % 2 === 1 ? 'Masculin' : 'Feminin';

    return {
      gender,
      dateOfBirth,
      age,
      county: this.COUNTY_CODES[countyCode] || 'Unknown',
      isValid: true
    };
  }
}

export function extractCNPInfo(cnp: string) {
  if (!CNPValidator.validate(cnp)) return null;

  const gender = parseInt(cnp.charAt(0));
  const year = parseInt(cnp.substring(1, 3));
  const month = parseInt(cnp.substring(3, 5));
  const day = parseInt(cnp.substring(5, 7));

  // Calculate full year based on gender
  const fullYear = gender <= 2 ? 1900 + year : 
                  gender <= 4 ? 2000 + year :
                  gender <= 6 ? 1900 + year :
                  gender <= 8 ? 2000 + year : 1900 + year;

  return {
    gender: gender % 2 === 1 ? 'M' : 'F',
    dateOfBirth: new Date(fullYear, month - 1, day),
    county: cnp.substring(7, 9),
    sequence: cnp.substring(9, 12),
    controlDigit: cnp.charAt(12)
  };
} 
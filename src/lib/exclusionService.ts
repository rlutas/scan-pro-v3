import { CNPValidator } from './cnpUtils';

export interface ExclusionStatus {
  isExcluded: boolean;
  loading: boolean;
  error?: string;
  reason?: string;
  verified: boolean;
}

export class ExclusionService {
  private static readonly MIN_GAMBLING_AGE = 18;

  static async checkExclusion(cnp: string): Promise<ExclusionStatus> {
    try {
      // First check age from CNP
      const cnpInfo = CNPValidator.extractInfo(cnp);
      if (!cnpInfo) {
        return {
          isExcluded: true,
          reason: 'Invalid CNP format',
          loading: false,
          verified: false
        };
      }

      if (cnpInfo.age < this.MIN_GAMBLING_AGE) {
        return {
          isExcluded: true,
          reason: `Under ${this.MIN_GAMBLING_AGE} years old - not allowed to gamble`,
          loading: false,
          verified: true
        };
      }

      // Check exclusion via API
      const response = await fetch(`/api/check-exclusion?cnp=${encodeURIComponent(cnp)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check exclusion status');
      }

      if (data.isExcluded) {
        return {
          isExcluded: true,
          reason: 'Found in self-exclusion list',
          loading: false,
          verified: true
        };
      }

      // If all checks pass, return allowed status
      return {
        isExcluded: false,
        reason: 'Allowed to gamble',
        loading: false,
        verified: true
      };

    } catch (error) {
      console.error('Error checking exclusion status:', error);
      return {
        isExcluded: true,
        reason: 'Error checking exclusion status',
        loading: false,
        verified: false
      };
    }
  }
} 
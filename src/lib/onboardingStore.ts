export type ExamTrack = 'YKS_KLASIK' | 'YKS_MAARIF' | 'LGS_KLASIK' | 'LGS_MAARIF';

export interface StudentProfileData {
  track: ExamTrack;
  targetSchool: string;
  targetDepartment: string;
  targetRankOrScore: string;
  isOnboardingCompleted: boolean;
}

const STORAGE_KEY = 'koc_takip_student_profile';

export const getStudentProfile = (): StudentProfileData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveStudentProfile = (profile: StudentProfileData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Profil kaydedilemedi:', err);
  }
};
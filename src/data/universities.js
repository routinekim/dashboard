import rawData from '../universities_data.json';

// Filter to only main campuses (본교) for cleaner data
export const universities = rawData.filter(u => u.campus === '본교');

export const hansei = universities.find(u => u.name === '한세대학교');

export const competitors = ['안양대학교', '성결대학교', '협성대학교', '평택대학교', '한신대학교']
  .map(name => universities.find(u => u.name === name))
  .filter(Boolean);

export const AXIS_METRICS = [
  { key: 'employmentRate', label: '취업률', unit: '%' },
  { key: 'competitionRate', label: '신입생 경쟁률', unit: ':1' },
  { key: 'fillRate', label: '신입생 충원율', unit: '%' },
  { key: 'facultyRateByQuota', label: '교원확보율(정원)', unit: '%' },
  { key: 'facultyRateByEnrolled', label: '교원확보율(재학)', unit: '%' },
  { key: 'studentsPerFaculty', label: '교원1인당 학생수', unit: '명' },
  { key: 'scholarshipPerStudent', label: '1인당 장학금', unit: '원' },
  { key: 'educationCostPerStudent', label: '1인당 교육비', unit: '천원' },
  { key: 'dormitoryRate', label: '기숙사 수용률', unit: '%' },
  { key: 'fullTimeLectureRatio', label: '전임교원 강의비율', unit: '%' },
];

export const SIZE_METRICS = [
  { key: 'enrolled', label: '재학생 수' },
  { key: 'admissionQuota', label: '입학정원' },
  { key: 'graduates', label: '졸업생 수' },
];

export const RADAR_METRICS = [
  { key: 'employmentRate', label: '취업률', unit: '%', max: 100 },
  { key: 'facultyRateByQuota', label: '교원확보율', unit: '%', max: 150 },
  { key: 'educationCostPerStudent', label: '1인당 교육비', unit: '천원', max: 30000 },
  { key: 'scholarshipPerStudent', label: '1인당 장학금', unit: '원', max: 8000000 },
  { key: 'dormitoryRate', label: '기숙사 수용률', unit: '%', max: 100 },
  { key: 'competitionRate', label: '신입생 경쟁률', unit: ':1', max: 25 },
];

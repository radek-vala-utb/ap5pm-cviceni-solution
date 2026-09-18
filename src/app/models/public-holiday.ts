export interface PublicHoliday {
  id: string;
  startDate: string;
  endDate: string;
  name: { language: string; text: string }[];
}
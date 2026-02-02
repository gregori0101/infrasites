import { useState, useCallback } from 'react';
import { fetchLatestReportWithPhotosBySiteCode, ReportRow } from '@/lib/reportDatabase';
import { reportToChecklistWithPhotos } from '@/lib/reportToChecklist';
import { ChecklistData } from '@/types/checklist';

interface UsePreviousReportResult {
  isLoading: boolean;
  previousReport: ReportRow | null;
  previousChecklistData: ChecklistData | null;
  lastInspectionDate: string | null;
  checkForPreviousReport: (siteCode: string) => Promise<void>;
  clearPreviousReport: () => void;
}

export function usePreviousReport(): UsePreviousReportResult {
  const [isLoading, setIsLoading] = useState(false);
  const [previousReport, setPreviousReport] = useState<ReportRow | null>(null);
  const [previousChecklistData, setPreviousChecklistData] = useState<ChecklistData | null>(null);
  const [lastInspectionDate, setLastInspectionDate] = useState<string | null>(null);

  const checkForPreviousReport = useCallback(async (siteCode: string) => {
    // Only search when site code is complete (5 characters)
    if (siteCode.length !== 5) {
      setPreviousReport(null);
      setPreviousChecklistData(null);
      setLastInspectionDate(null);
      return;
    }

    setIsLoading(true);
    try {
      // Use the version that includes all photo columns
      const report = await fetchLatestReportWithPhotosBySiteCode(siteCode);
      
      if (report) {
        setPreviousReport(report);
        const checklistData = reportToChecklistWithPhotos(report);
        setPreviousChecklistData(checklistData);
        setLastInspectionDate(report.created_at || null);
      } else {
        setPreviousReport(null);
        setPreviousChecklistData(null);
        setLastInspectionDate(null);
      }
    } catch (error) {
      console.error('Error checking for previous report:', error);
      setPreviousReport(null);
      setPreviousChecklistData(null);
      setLastInspectionDate(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearPreviousReport = useCallback(() => {
    setPreviousReport(null);
    setPreviousChecklistData(null);
    setLastInspectionDate(null);
  }, []);

  return {
    isLoading,
    previousReport,
    previousChecklistData,
    lastInspectionDate,
    checkForPreviousReport,
    clearPreviousReport,
  };
}

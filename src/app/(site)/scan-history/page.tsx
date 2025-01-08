'use client';

import React, { useEffect, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../../components/ui/table";
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface ScanHistoryRecord {
  id: string;
  cnp: string;
  scannedAt: string;
  device: {
    name: string;
    location: string;
    fingerprint: string;
    userAgent: string;
  };
  wasAllowed: boolean;
  reason: string | null;
}

export default function ScanHistoryPage() {
  const [scans, setScans] = useState<ScanHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredScans, setFilteredScans] = useState<ScanHistoryRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchScanHistory();
  }, []);

  useEffect(() => {
    const filtered = scans.filter(scan => 
      scan.cnp.toLowerCase().includes(searchTerm.toLowerCase()) || 
      scan.device.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.device.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort the filtered scans
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.scannedAt).getTime();
      const dateB = new Date(b.scannedAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredScans(sorted);
  }, [searchTerm, scans, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const fetchScanHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/scan-history');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Failed to fetch scan history');
      }

      const data = await response.json().catch(() => null);
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from server');
      }

      if (!Array.isArray(data.data)) {
        console.error('Invalid data format:', data);
        throw new Error('Invalid data format received from server');
      }

      setScans(data.data);
      setError(null);

      if (data.message && data.data.length === 0) {
        toast.custom(data.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load scan history';
      console.error('Error fetching scan history:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      setScans([]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['CNP', 'Scanned At', 'Device Name', 'Location', 'Was Allowed', 'Reason', 'Device Fingerprint', 'User Agent'];
    const csvData = filteredScans.map(scan => [
      scan.cnp,
      format(new Date(scan.scannedAt), 'yyyy-MM-dd HH:mm:ss'),
      scan.device.name,
      scan.device.location,
      scan.wasAllowed ? 'Yes' : 'No',
      scan.reason || '',
      scan.device.fingerprint,
      scan.device.userAgent
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `scan-history-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="relative z-10 overflow-hidden pt-28 lg:pt-[150px]">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-body-color" />
              <Input
                type="text"
                placeholder="Search by CNP, Location, or Device..."
                className="w-full pl-11 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={toggleSortOrder} 
              variant="outline"
              className="flex items-center gap-2"
            >
              Sort by Date {sortOrder === 'desc' ? '↓' : '↑'}
            </Button>
            <Button onClick={exportToCSV} className="flex items-center gap-2">
              <Download size={20} />
              Export to CSV
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CNP</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      Scanned At
                      <button 
                        onClick={toggleSortOrder}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {sortOrder === 'desc' ? '↓' : '↑'}
                      </button>
                    </div>
                  </TableHead>
                  <TableHead>Device Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {error ? 'Error loading scan records' : 'No scan records found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredScans.map((scan) => (
                    <TableRow key={scan.id}>
                      <TableCell className="font-medium">{scan.cnp}</TableCell>
                      <TableCell>{format(new Date(scan.scannedAt), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                      <TableCell>{scan.device.name}</TableCell>
                      <TableCell>{scan.device.location}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          scan.wasAllowed
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                        }`}>
                          {scan.wasAllowed ? 'Allowed' : 'Denied'}
                        </span>
                      </TableCell>
                      <TableCell>{scan.reason || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </section>
  );
}

// ... existing code ... 
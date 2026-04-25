import type { Patient, Alert, Ward } from './types';

const fetcher = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
};

export const api = {
  patients: {
    list: async (params?: { wardId?: string; status?: string }): Promise<Patient[]> => {
      const q = new URLSearchParams();
      if (params?.wardId) q.append('wardId', params.wardId);
      if (params?.status) q.append('status', params.status);
      const data = await fetcher<{ patients: Patient[] }>(`/api/patients?${q.toString()}`);
      return data.patients;
    },
    getVitalsTrend: async (patientId: string, rangeHours = 24): Promise<Patient['trend']> => {
      const data = await fetcher<{ trend: Patient['trend'] }>(`/api/patients/${patientId}/vitals?range=${rangeHours}`);
      return data.trend;
    },
    allocate: async (payload: {
      name: string;
      age?: number;
      gender?: string;
      bedId: string;
      wardId: string;
      diagnosis: string;
      status?: string;
      attendingPhysician?: string;
      primaryNurse?: string;
    }): Promise<{ success: boolean; patientId: string }> => {
      return fetcher<{ success: boolean; patientId: string }>('/api/patients', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    discharge: async (patientId: string): Promise<{ success: boolean; freedBedId: string }> => {
      return fetcher<{ success: boolean; freedBedId: string }>(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });
    },
  },
  alerts: {
    list: async (params?: { wardId?: string; status?: string; severity?: string }): Promise<Alert[]> => {
      const q = new URLSearchParams();
      if (params?.wardId) q.append('wardId', params.wardId);
      if (params?.status) q.append('status', params.status);
      if (params?.severity) q.append('severity', params.severity);
      const data = await fetcher<{ alerts: Alert[] }>(`/api/alerts?${q.toString()}`);
      return data.alerts;
    },
    update: async (id: string, updates: Partial<Pick<Alert, 'status' | 'notes' | 'escalationLevel'>>): Promise<void> => {
      await fetcher<{ success: boolean }>(`/api/alerts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    }
  },
  wards: {
    list: async (): Promise<Ward[]> => {
      const data = await fetcher<{ wards: Ward[] }>('/api/wards');
      return data.wards;
    }
  },
  dashboard: {
    kpis: async (): Promise<any> => {
      return fetcher<any>('/api/dashboard/kpis');
    }
  }
};

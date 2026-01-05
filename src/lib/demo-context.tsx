'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  Patient,
  TriageSession,
  CarePathway,
  IntakeSummary,
  TreatmentPlan,
  CareRequest,
  Provider,
  UserRole,
  Consent,
  AuditLog,
  DEMO_PROVIDERS,
  generateId,
  logAudit,
} from './demo-store';

type DemoUser = {
  id: string;
  name: string;
  role: UserRole;
  email: string;
};

type DemoState = {
  // Current user
  currentUser: DemoUser | null;

  // Patient data
  patients: Patient[];
  triageSessions: TriageSession[];
  intakeSummaries: IntakeSummary[];
  treatmentPlans: TreatmentPlan[];
  careRequests: CareRequest[];

  // Static data
  providers: Provider[];

  // Audit
  auditLogs: AuditLog[];
};

type DemoContextType = DemoState & {
  // Auth actions
  loginAs: (role: UserRole, name?: string) => void;
  logout: () => void;

  // Patient actions
  registerPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'consents'>) => Patient;
  addConsent: (patientId: string, consent: Omit<Consent, 'id' | 'timestamp'>) => void;

  // Triage actions
  saveTriageSession: (session: Omit<TriageSession, 'id' | 'completedAt'>) => TriageSession;
  updateCarePathwaySelection: (sessionId: string, pathwayId: string, accepted: boolean) => void;

  // Intake actions
  saveIntakeSummary: (summary: Omit<IntakeSummary, 'id' | 'completedAt'>) => IntakeSummary;

  // Treatment plan actions
  createTreatmentPlan: (plan: Omit<TreatmentPlan, 'id' | 'createdAt' | 'status'>) => TreatmentPlan;
  updateTreatmentPlanStatus: (planId: string, status: TreatmentPlan['status']) => void;

  // Care request actions (Uber model)
  sendCareRequests: (treatmentPlanId: string, providerIds: string[], discipline: string) => CareRequest[];
  respondToCareRequest: (requestId: string, accepted: boolean, appointmentDate?: string) => void;

  // Getters
  getPatientById: (id: string) => Patient | undefined;
  getTriageSessionByPatientId: (patientId: string) => TriageSession | undefined;
  getIntakeSummariesByPatientId: (patientId: string) => IntakeSummary[];
  getTreatmentPlansByPatientId: (patientId: string) => TreatmentPlan[];
  getCareRequestsByTreatmentPlanId: (treatmentPlanId: string) => CareRequest[];
  getCareRequestsByProviderId: (providerId: string) => CareRequest[];
  getProvidersByDiscipline: (discipline: string) => Provider[];
  getProvidersByInsurer: (insurer: string, discipline?: string) => Provider[];

  // Demo utilities
  seedDemoData: () => void;
  clearDemoData: () => void;
};

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<DemoState>({
    currentUser: null,
    patients: [],
    triageSessions: [],
    intakeSummaries: [],
    treatmentPlans: [],
    careRequests: [],
    providers: DEMO_PROVIDERS,
    auditLogs: [],
  });

  // Prevent hydration mismatch by waiting for client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth actions
  const loginAs = useCallback((role: UserRole, name?: string) => {
    const defaultNames: Record<UserRole, string> = {
      patient: 'Jan de Vries',
      coordinator: 'Dr. Anna Bakker',
      provider: 'Fysiotherapie Amsterdam Noord',
    };

    const user: DemoUser = {
      id: generateId(),
      name: name || defaultNames[role],
      role,
      email: `${role}@demo.oscar.nl`,
    };

    setState(prev => ({ ...prev, currentUser: user }));
    logAudit(user.id, role, 'LOGIN', 'user', user.id, `User logged in as ${role}`);
  }, []);

  const logout = useCallback(() => {
    if (state.currentUser) {
      logAudit(state.currentUser.id, state.currentUser.role, 'LOGOUT', 'user', state.currentUser.id, 'User logged out');
    }
    setState(prev => ({ ...prev, currentUser: null }));
  }, [state.currentUser]);

  // Patient actions
  const registerPatient = useCallback((patientData: Omit<Patient, 'id' | 'createdAt' | 'consents'>): Patient => {
    const patient: Patient = {
      ...patientData,
      id: generateId(),
      createdAt: new Date(),
      consents: [],
    };

    setState(prev => ({
      ...prev,
      patients: [...prev.patients, patient],
    }));

    logAudit(patient.id, 'patient', 'REGISTER', 'patient', patient.id, 'New patient registered');
    return patient;
  }, []);

  const addConsent = useCallback((patientId: string, consentData: Omit<Consent, 'id' | 'timestamp'>) => {
    const consent: Consent = {
      ...consentData,
      id: generateId(),
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      patients: prev.patients.map(p =>
        p.id === patientId ? { ...p, consents: [...p.consents, consent] } : p
      ),
    }));

    logAudit(patientId, 'patient', 'CONSENT_GRANTED', 'consent', consent.id, `Consent granted: ${consentData.type}`);
  }, []);

  // Triage actions
  const saveTriageSession = useCallback((sessionData: Omit<TriageSession, 'id' | 'completedAt'>): TriageSession => {
    const session: TriageSession = {
      ...sessionData,
      id: generateId(),
      completedAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      triageSessions: [...prev.triageSessions, session],
    }));

    logAudit(sessionData.patientId, 'patient', 'TRIAGE_COMPLETED', 'triage_session', session.id,
      `Triage completed. Red flags: ${session.hasRedFlags ? 'YES' : 'NO'}`);
    return session;
  }, []);

  const updateCarePathwaySelection = useCallback((sessionId: string, pathwayId: string, accepted: boolean) => {
    setState(prev => ({
      ...prev,
      triageSessions: prev.triageSessions.map(session =>
        session.id === sessionId
          ? {
              ...session,
              carePathways: session.carePathways.map(pathway =>
                pathway.id === pathwayId ? { ...pathway, accepted } : pathway
              ),
            }
          : session
      ),
    }));
  }, []);

  // Intake actions
  const saveIntakeSummary = useCallback((summaryData: Omit<IntakeSummary, 'id' | 'completedAt'>): IntakeSummary => {
    const summary: IntakeSummary = {
      ...summaryData,
      id: generateId(),
      completedAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      intakeSummaries: [...prev.intakeSummaries, summary],
    }));

    logAudit(summaryData.patientId, 'patient', 'INTAKE_COMPLETED', 'intake_summary', summary.id,
      `Intake completed for ${summaryData.discipline}`);
    return summary;
  }, []);

  // Treatment plan actions
  const createTreatmentPlan = useCallback((planData: Omit<TreatmentPlan, 'id' | 'createdAt' | 'status'>): TreatmentPlan => {
    const plan: TreatmentPlan = {
      ...planData,
      id: generateId(),
      createdAt: new Date(),
      status: 'draft',
    };

    setState(prev => ({
      ...prev,
      treatmentPlans: [...prev.treatmentPlans, plan],
    }));

    logAudit(planData.coordinatorId, 'coordinator', 'TREATMENT_PLAN_CREATED', 'treatment_plan', plan.id,
      `Treatment plan created for patient ${planData.patientId}`);
    return plan;
  }, []);

  const updateTreatmentPlanStatus = useCallback((planId: string, status: TreatmentPlan['status']) => {
    setState(prev => ({
      ...prev,
      treatmentPlans: prev.treatmentPlans.map(plan =>
        plan.id === planId ? { ...plan, status } : plan
      ),
    }));
  }, []);

  // Care request actions (Uber model)
  const sendCareRequests = useCallback((treatmentPlanId: string, providerIds: string[], discipline: string): CareRequest[] => {
    const plan = state.treatmentPlans.find(p => p.id === treatmentPlanId);
    if (!plan) return [];

    const requests: CareRequest[] = providerIds.map(providerId => {
      const provider = state.providers.find(p => p.id === providerId);
      return {
        id: generateId(),
        treatmentPlanId,
        patientId: plan.patientId,
        providerId,
        providerName: provider?.name || 'Unknown Provider',
        discipline,
        status: 'pending' as const,
        sentAt: new Date(),
      };
    });

    setState(prev => ({
      ...prev,
      careRequests: [...prev.careRequests, ...requests],
    }));

    requests.forEach(req => {
      logAudit(plan.coordinatorId, 'coordinator', 'CARE_REQUEST_SENT', 'care_request', req.id,
        `Care request sent to ${req.providerName}`);
    });

    return requests;
  }, [state.treatmentPlans, state.providers]);

  const respondToCareRequest = useCallback((requestId: string, accepted: boolean, appointmentDate?: string) => {
    setState(prev => {
      const request = prev.careRequests.find(r => r.id === requestId);
      if (!request) return prev;

      // If accepted, withdraw all other pending requests for same treatment plan
      let updatedRequests = prev.careRequests.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            status: accepted ? 'accepted' as const : 'declined' as const,
            respondedAt: new Date(),
            appointmentDate: accepted ? appointmentDate : undefined,
          };
        }
        // Withdraw other pending requests if this one is accepted (Uber model)
        if (accepted && req.treatmentPlanId === request.treatmentPlanId && req.status === 'pending') {
          return { ...req, status: 'withdrawn' as const, respondedAt: new Date() };
        }
        return req;
      });

      // Update treatment plan status if accepted
      let updatedPlans = prev.treatmentPlans;
      if (accepted) {
        updatedPlans = prev.treatmentPlans.map(plan =>
          plan.id === request.treatmentPlanId ? { ...plan, status: 'active' as const } : plan
        );
      }

      return { ...prev, careRequests: updatedRequests, treatmentPlans: updatedPlans };
    });

    const request = state.careRequests.find(r => r.id === requestId);
    if (request) {
      logAudit(request.providerId, 'provider', accepted ? 'CARE_REQUEST_ACCEPTED' : 'CARE_REQUEST_DECLINED',
        'care_request', requestId, `Care request ${accepted ? 'accepted' : 'declined'}`);
    }
  }, [state.careRequests]);

  // Getters
  const getPatientById = useCallback((id: string) => {
    return state.patients.find(p => p.id === id);
  }, [state.patients]);

  const getTriageSessionByPatientId = useCallback((patientId: string) => {
    return state.triageSessions.find(s => s.patientId === patientId);
  }, [state.triageSessions]);

  const getIntakeSummariesByPatientId = useCallback((patientId: string) => {
    return state.intakeSummaries.filter(s => s.patientId === patientId);
  }, [state.intakeSummaries]);

  const getTreatmentPlansByPatientId = useCallback((patientId: string) => {
    return state.treatmentPlans.filter(p => p.patientId === patientId);
  }, [state.treatmentPlans]);

  const getCareRequestsByTreatmentPlanId = useCallback((treatmentPlanId: string) => {
    return state.careRequests.filter(r => r.treatmentPlanId === treatmentPlanId);
  }, [state.careRequests]);

  const getCareRequestsByProviderId = useCallback((providerId: string) => {
    return state.careRequests.filter(r => r.providerId === providerId);
  }, [state.careRequests]);

  const getProvidersByDiscipline = useCallback((discipline: string) => {
    return state.providers.filter(p => p.discipline === discipline);
  }, [state.providers]);

  const getProvidersByInsurer = useCallback((insurer: string, discipline?: string) => {
    return state.providers.filter(p =>
      p.insurers.includes(insurer) && (!discipline || p.discipline === discipline)
    );
  }, [state.providers]);

  // Seed demo data for testing
  const seedDemoData = useCallback(() => {
    // Patient 1 - Complete flow ready for coordinator
    const patient1: Patient = {
      id: 'demo-patient-1',
      name: 'Maria Jansen',
      email: 'maria.jansen@email.nl',
      phone: '06-12345678',
      dateOfBirth: '1968-05-15',
      bsn: '123456789',
      insurer: 'Zilveren Kruis',
      insurerNumber: 'ZK-2024-001',
      createdAt: new Date(Date.now() - 86400000),
      consents: [
        { id: 'c1', type: 'data_processing', granted: true, timestamp: new Date(Date.now() - 86400000), description: 'Toestemming gegevensverwerking' },
        { id: 'c2', type: 'share_intake', granted: true, timestamp: new Date(Date.now() - 86400000), description: 'Toestemming delen intake' },
      ],
    };

    const session1: TriageSession = {
      id: 'demo-session-1',
      patientId: 'demo-patient-1',
      answers: {
        complaintType: 'artrose',
        complaintDuration: 'longer',
        painLevel: '7',
        smokes: 'false',
        followsDiet: 'false',
        exercisesRegularly: 'false',
        hasHadPhysio: 'false',
        hindersDaily: 'true',
      },
      redFlags: [],
      hasRedFlags: false,
      completedAt: new Date(Date.now() - 86400000),
      carePathways: [
        { id: 'cp1', discipline: 'fysiotherapie', name: 'Fysiotherapie', description: 'Behandeling voor beweging en pijnvermindering', recommended: true, accepted: true, reasonForRecommendation: 'U doet geen specifieke oefeningen en heeft nog geen fysiotherapie gehad.' },
        { id: 'cp2', discipline: 'ergotherapie', name: 'Ergotherapie', description: 'Hulp bij dagelijkse activiteiten', recommended: true, accepted: true, reasonForRecommendation: 'Uw klachten duren langer dan 3 maanden en hinderen u in het dagelijks leven.' },
        { id: 'cp3', discipline: 'dietetiek', name: 'Dieetadvies', description: 'Voedingsadvies voor artrose', recommended: true, accepted: true, reasonForRecommendation: 'U volgt nog geen anti-inflammatoir dieet.' },
      ],
    };

    const intake1: IntakeSummary = {
      id: 'demo-intake-1',
      patientId: 'demo-patient-1',
      triageSessionId: 'demo-session-1',
      discipline: 'fysiotherapie',
      answers: { mainGoal: 'Minder pijn bij dagelijkse activiteiten', limitations: 'Traplopen, lang staan', painMoment: 'Bij inspanning', previousTreatment: 'Paracetamol' },
      summary: `Fysiotherapie Intake\n\nHoofddoel: Minder pijn bij dagelijkse activiteiten en beter kunnen wandelen\nBeperkingen: Traplopen, lang staan, fietsen\nPijnmoment: Bij inspanning\nEerder geprobeerd: Paracetamol, warmte kompressen\n\nBeschikbaarheid: Maandagochtend, Woensdagmiddag\nVoorkeur contact: email`,
      completedAt: new Date(Date.now() - 82800000),
    };

    // Patient 2 - With red flags
    const patient2: Patient = {
      id: 'demo-patient-2',
      name: 'Jan de Vries',
      email: 'jan.devries@email.nl',
      phone: '06-98765432',
      dateOfBirth: '1955-11-22',
      bsn: '987654321',
      insurer: 'VGZ',
      insurerNumber: 'VGZ-2024-042',
      createdAt: new Date(Date.now() - 43200000),
      consents: [
        { id: 'c3', type: 'data_processing', granted: true, timestamp: new Date(Date.now() - 43200000), description: 'Toestemming gegevensverwerking' },
        { id: 'c4', type: 'share_intake', granted: true, timestamp: new Date(Date.now() - 43200000), description: 'Toestemming delen intake' },
      ],
    };

    const session2: TriageSession = {
      id: 'demo-session-2',
      patientId: 'demo-patient-2',
      answers: {
        complaintType: 'kniepijn',
        complaintDuration: 'longer',
        painLevel: '8',
        smokes: 'true',
        followsDiet: 'false',
        exercisesRegularly: 'false',
        hasHadPhysio: 'true',
        hindersDaily: 'true',
      },
      redFlags: [
        { id: 'rf1', question: 'Nachtelijke pijn die u wakker maakt?', detected: true, severity: 'medium', action: 'Verwijzing huisarts voor nader onderzoek' },
      ],
      hasRedFlags: true,
      completedAt: new Date(Date.now() - 43200000),
      carePathways: [
        { id: 'cp4', discipline: 'fysiotherapie', name: 'Fysiotherapie', description: 'Behandeling voor beweging', recommended: true, accepted: true, reasonForRecommendation: 'Ondanks eerdere fysiotherapie zijn klachten niet verminderd.' },
        { id: 'cp5', discipline: 'stoppen_met_roken', name: 'Stoppen met Roken', description: 'Begeleiding bij stoppen', recommended: true, accepted: true, reasonForRecommendation: 'Roken vertraagt herstel en verergert klachten.' },
      ],
    };

    const intake2: IntakeSummary = {
      id: 'demo-intake-2',
      patientId: 'demo-patient-2',
      triageSessionId: 'demo-session-2',
      discipline: 'fysiotherapie',
      answers: { mainGoal: 'Weer kunnen wandelen zonder pijn', limitations: 'Wandelen, traplopen, bukken', painMoment: 's Nachts en bij inspanning', previousTreatment: 'Fysiotherapie (6 sessies), pijnstillers' },
      summary: `Fysiotherapie Intake\n\nHoofddoel: Weer kunnen wandelen zonder pijn\nBeperkingen: Wandelen, traplopen, bukken\nPijnmoment: 's Nachts en bij inspanning\nEerder geprobeerd: Fysiotherapie (6 sessies), pijnstillers\n\nBeschikbaarheid: Dinsdagmiddag, Donderdagochtend\nVoorkeur contact: telefoon\n\nLET OP: Red flag gedetecteerd - nachtelijke pijn`,
      completedAt: new Date(Date.now() - 40000000),
    };

    // Patient 3 - Simple case
    const patient3: Patient = {
      id: 'demo-patient-3',
      name: 'Anna Bakker',
      email: 'anna.bakker@email.nl',
      phone: '06-11223344',
      dateOfBirth: '1972-03-08',
      bsn: '456789123',
      insurer: 'CZ',
      insurerNumber: 'CZ-2024-789',
      createdAt: new Date(Date.now() - 21600000),
      consents: [
        { id: 'c5', type: 'data_processing', granted: true, timestamp: new Date(Date.now() - 21600000), description: 'Toestemming gegevensverwerking' },
      ],
    };

    const session3: TriageSession = {
      id: 'demo-session-3',
      patientId: 'demo-patient-3',
      answers: {
        complaintType: 'schouderpijn',
        complaintDuration: '3months',
        painLevel: '5',
        smokes: 'false',
        followsDiet: 'true',
        exercisesRegularly: 'true',
        hasHadPhysio: 'false',
        hindersDaily: 'false',
      },
      redFlags: [],
      hasRedFlags: false,
      completedAt: new Date(Date.now() - 21600000),
      carePathways: [
        { id: 'cp6', discipline: 'fysiotherapie', name: 'Fysiotherapie', description: 'Behandeling voor schouder', recommended: true, accepted: true, reasonForRecommendation: 'U heeft nog geen fysiotherapie gehad voor deze klacht.' },
      ],
    };

    const intake3: IntakeSummary = {
      id: 'demo-intake-3',
      patientId: 'demo-patient-3',
      triageSessionId: 'demo-session-3',
      discipline: 'fysiotherapie',
      answers: { mainGoal: 'Schouder weer volledig kunnen bewegen', limitations: 'Arm heffen, achter rug reiken', painMoment: 'Bij specifieke bewegingen', previousTreatment: 'Geen' },
      summary: `Fysiotherapie Intake\n\nHoofddoel: Schouder weer volledig kunnen bewegen\nBeperkingen: Arm heffen, achter rug reiken\nPijnmoment: Bij specifieke bewegingen\nEerder geprobeerd: Geen behandeling\n\nBeschikbaarheid: Flexibel\nVoorkeur contact: email`,
      completedAt: new Date(Date.now() - 18000000),
    };

    setState(prev => ({
      ...prev,
      patients: [patient1, patient2, patient3],
      triageSessions: [session1, session2, session3],
      intakeSummaries: [intake1, intake2, intake3],
      treatmentPlans: [],
      careRequests: [],
    }));
  }, []);

  const clearDemoData = useCallback(() => {
    setState({
      currentUser: null,
      patients: [],
      triageSessions: [],
      intakeSummaries: [],
      treatmentPlans: [],
      careRequests: [],
      providers: DEMO_PROVIDERS,
      auditLogs: [],
    });
  }, []);

  const value: DemoContextType = {
    ...state,
    loginAs,
    logout,
    registerPatient,
    addConsent,
    saveTriageSession,
    updateCarePathwaySelection,
    saveIntakeSummary,
    createTreatmentPlan,
    updateTreatmentPlanStatus,
    sendCareRequests,
    respondToCareRequest,
    getPatientById,
    getTriageSessionByPatientId,
    getIntakeSummariesByPatientId,
    getTreatmentPlansByPatientId,
    getCareRequestsByTreatmentPlanId,
    getCareRequestsByProviderId,
    getProvidersByDiscipline,
    getProvidersByInsurer,
    seedDemoData,
    clearDemoData,
  };

  // Show nothing until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

// hooks/useHeaderLogic.ts
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { RefObject } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
  id: string;
  firstname: string;
  lastname: string;
  is_admin: boolean;
  is_super_admin: boolean
  is_manager: boolean;
}

interface UseHeaderLogicReturn {
  isLoginOpen: boolean;
  setIsLoginOpen: (val: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
  isHRToolsMenuOpen: boolean;
  setIsHRToolsMenuOpen: (val: boolean) => void;
  isAccountMenuOpen: boolean;
  setIsAccountMenuOpen: (val: boolean) => void;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: (val: boolean) => void;
  login: string;
  setLogin: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  user: User | null;
  error: string;
  companyLogo: string | null;
  companyId: string | null;
  companyForfait: string | null;
  canAccessHappyCheck: boolean | null;
  demoTimeLeft: number | null;
  isDemoMode: boolean;
  isDemoExpired: boolean;

  hrToolsMenuRef: RefObject<HTMLDivElement | null>;
  accountMenuRef: RefObject<HTMLDivElement | null>;
  userMenuRef: RefObject<HTMLDivElement | null>;

  companySlug: string | null;
  buildLink: (basePath: string) => string;

  handleLogin: (email?: string, pwd?: string) => Promise<void>; 
  handleLogout: () => Promise<void>;
  formatTime: (seconds: number) => string;
}

export const useHeaderLogic = () : UseHeaderLogicReturn => {
  // All state management
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHRToolsMenuOpen, setIsHRToolsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<{ id: string; firstname: string; lastname: string; is_admin:boolean ; is_super_admin:boolean ; is_manager:boolean} | null>(null);
  const [error, setError] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyForfait, setCompanyForfait] = useState<string | null>(null);
  const [canAccessHappyCheck, setCanAccessHappyCheck] = useState<boolean | null>(null);
  const [demoTimeLeft, setDemoTimeLeft] = useState<number | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDemoExpired, setIsDemoExpired] = useState(false);

  // Refs
  const demoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const expirationHandledRef = useRef(false);
  const happyCheckAccessChecked = useRef(false);
  const hrToolsMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();

  // Computed values
  const slugMatch = useMemo(() => pathname.match(/^\/jobs\/([^/]+)/), [pathname]);
  const companySlug = useMemo(() => slugMatch ? slugMatch[1] : null, [slugMatch]);

  const buildLink = useCallback((basePath: string) => {
    const query = companyId ? `?company_id=${companyId}` : '';
    if (!companySlug) return '/404';
    if (basePath === '/') return `/jobs/${companySlug}${query}`;
    return `/jobs/${companySlug}${basePath}${query}`;
  }, [companyId, companySlug]);

  // Fetch functions
  const fetchUserProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('id, user_firstname, user_lastname, is_admin, is_super_admin, is_manager')
      .eq('id', userId)
      .single();
    if (data) setUser({ id: data.id, firstname: data.user_firstname, lastname: data.user_lastname, is_admin: data.is_admin, is_super_admin: data.is_super_admin, is_manager: data.is_manager });
  }, []);

  const fetchUserCompanyId = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('company_to_users')
      .select('company_id')
      .eq('user_id', userId)
      .single();
    if (!error && data?.company_id) setCompanyId(data.company_id);
  }, []);

  const fetchCompanyLogoAndId = useCallback(async (slug: string) => {
    const { data } = await supabase
      .from('company')
      .select('company_logo, id, forfait')
      .eq('slug', slug)
      .single();
    setCompanyLogo(data?.company_logo || null);
    setCompanyId(data?.id || null);
    setCompanyForfait(data?.forfait || null);
  }, []);

  const checkHappyCheckAccess = useCallback(async () => {
    if (!companyId || happyCheckAccessChecked.current) return;
    
    happyCheckAccessChecked.current = true;
    
    try {
      const { data, error } = await supabase.rpc('can_access_happy_check', { p_company_id: companyId })
      
      if (error) {
        setCanAccessHappyCheck(false);
        return;
      }
      
      if (data === null || data === undefined) {
        setCanAccessHappyCheck(false);
        return;
      }
      
      let hasAccess = false;
      
      if (typeof data === 'boolean') {
        hasAccess = data;
      } else if (typeof data === 'string') {
        hasAccess = data === 'true' || data === 'True' || data === 'TRUE';
      } else if (typeof data === 'number') {
        hasAccess = data === 1;
      } else if (typeof data === 'object' && data !== null) {
        hasAccess = data.result === true || data.result === 'true' || 
                   data.can_access === true || data.can_access === 'true' ||
                   data[0] === true || data[0] === 'true' ||
                   data === true;
      }
            
      setCanAccessHappyCheck(hasAccess);
      
    } catch (error) {
      console.error('Error checking happy check access:', error);
      setCanAccessHappyCheck(false);
    }
  }, [companyId]);

  // Demo expiration handler
  // Demo expiration handler
const handleDemoExpiration = useCallback(async () => {
  if (expirationHandledRef.current) return;
  expirationHandledRef.current = true;

  setIsDemoExpired(true);
  setIsDemoMode(false);
  setDemoTimeLeft(0);

  // Clear any saved demo info
  localStorage.removeItem('demo_start_time');
  localStorage.removeItem('demo_mode_active');

  // Log out the user if logged in
  if (user) {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  // Optional: redirect after demo expired
  if (companySlug === 'demo') {
    setTimeout(() => router.push(`/jobs/demo/feedback`), 2000);
  }
}, [user, companySlug, router]);

// Demo timer effect
useEffect(() => {
  if (companySlug !== 'demo') {
    // Not demo: clean up
    if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    setIsDemoMode(false);
    setIsDemoExpired(false);
    setDemoTimeLeft(null);
    return;
  }

  const DEMO_DURATION = 60 * 60 * 1000; // 60 minutes
  const DEMO_START_KEY = 'demo_start_time';

  // Initialize demo start time
  let demoStartTime = localStorage.getItem(DEMO_START_KEY);
  if (!demoStartTime) {
    demoStartTime = Date.now().toString();
    localStorage.setItem(DEMO_START_KEY, demoStartTime);
    localStorage.setItem('demo_mode_active', 'true');
  }

  const startTime = parseInt(demoStartTime, 10);
  const elapsed = Date.now() - startTime;
  const remaining = DEMO_DURATION - elapsed;

  if (remaining <= 0) {
    handleDemoExpiration();
    return;
  }

  setIsDemoMode(true);
  setIsDemoExpired(false);
  setDemoTimeLeft(Math.ceil(remaining / 1000));

  demoTimerRef.current = setInterval(() => {
    const currentElapsed = Date.now() - startTime;
    const currentRemaining = DEMO_DURATION - currentElapsed;

    if (currentRemaining <= 0) {
      clearInterval(demoTimerRef.current!);
      handleDemoExpiration();
      return;
    }

    setDemoTimeLeft(Math.ceil(currentRemaining / 1000));
  }, 1000);

  return () => {
    if (demoTimerRef.current) clearInterval(demoTimerRef.current);
  };
}, [companySlug, handleDemoExpiration]);


  // Auth handlers
 const handleLogin = useCallback(async (email?: string, pwd?: string) => {
  if (isDemoExpired) return;
  
  // Use provided credentials or fall back to state
  const loginEmail = email || login;
  const loginPassword = pwd || password;
  
  setError('');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password: loginPassword,
  });
  if (error) {
    setError('Invalid email or password!');
    return;
  }
  if (data.user) {
    fetchUserProfile(data.user.id);
    fetchUserCompanyId(data.user.id);
    setIsLoginOpen(false);
    const homeUrl = companySlug ? `/jobs/${companySlug}` : '/';
    router.push(homeUrl);
  }
}, [login, password, companySlug, router, fetchUserProfile, fetchUserCompanyId, isDemoExpired]);

  const handleLogout = useCallback(async () => {
  console.log('Logout - companySlug:', companySlug);
  const homeUrl = companySlug ? `/jobs/${companySlug}` : '/';
  console.log('Logout - homeUrl:', homeUrl);
  await supabase.auth.signOut();
  setUser(null);
  console.log('About to redirect to:', homeUrl);
  router.push(homeUrl);
}, [companySlug, router]);

  // Utility functions
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Effects
  useEffect(() => {
    if (companySlug === 'demo') {
      setLogin('demo@hrinno.hu');
      setPassword('demo');
    }
  }, [companySlug]);

  useEffect(() => {
    const DEMO_DURATION = 60 * 60 * 1000; // 60 minutes
    const DEMO_START_KEY = 'demo_start_time';
    const DEMO_MODE_KEY = 'demo_mode_active';

    const isDemoActive = companySlug === 'demo';

    if (isDemoActive) {
      let demoStartTime = localStorage.getItem(DEMO_START_KEY);
      if (!demoStartTime) {
        demoStartTime = Date.now().toString();
        localStorage.setItem(DEMO_START_KEY, demoStartTime);
        localStorage.setItem(DEMO_MODE_KEY, 'true');
      }

      const startTime = parseInt(demoStartTime, 10);
      const elapsed = Date.now() - startTime;
      const remaining = DEMO_DURATION - elapsed;

      if (remaining <= 0) {
        handleDemoExpiration();
        return;
      }

      setIsDemoMode(true);
      setIsDemoExpired(false);
      setDemoTimeLeft(Math.ceil(remaining / 1000));

      demoTimerRef.current = setInterval(() => {
        const currentElapsed = Date.now() - startTime;
        const currentRemaining = DEMO_DURATION - currentElapsed;

        if (currentRemaining <= 0) {
          handleDemoExpiration();
          return;
        }

        setDemoTimeLeft(Math.ceil(currentRemaining / 1000));
      }, 1000);

    } else {
      localStorage.removeItem(DEMO_START_KEY);
      localStorage.removeItem(DEMO_MODE_KEY);
      setIsDemoMode(false);
      setIsDemoExpired(false);
      setDemoTimeLeft(null);
      if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    }

    return () => {
      if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    };
  }, [companySlug, handleDemoExpiration]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const uid = data.session.user.id;
        fetchUserProfile(uid);
        fetchUserCompanyId(uid);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const uid = session.user.id;
        fetchUserProfile(uid);
        fetchUserCompanyId(uid);
      } else {
        setUser(null);
        if (companySlug) fetchCompanyLogoAndId(companySlug);
      }
    });

    if (companySlug) fetchCompanyLogoAndId(companySlug);

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [companySlug, fetchUserProfile, fetchUserCompanyId, fetchCompanyLogoAndId]);

  useEffect(() => {
    if (companyId) {
      happyCheckAccessChecked.current = false;
      setCanAccessHappyCheck(null);
      checkHappyCheckAccess();
    }
  }, [companyId, checkHappyCheckAccess]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hrToolsMenuRef.current && !hrToolsMenuRef.current.contains(event.target as Node)) {
        setIsHRToolsMenuOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
    // State
    isLoginOpen, setIsLoginOpen,
    isMobileMenuOpen, setIsMobileMenuOpen,
    isHRToolsMenuOpen, setIsHRToolsMenuOpen,
    isAccountMenuOpen, setIsAccountMenuOpen,
    isUserMenuOpen, setIsUserMenuOpen,
    login, setLogin,
    password, setPassword,
    user,
    error,
    companyLogo,
    companyId,
    companyForfait,
    canAccessHappyCheck,
    demoTimeLeft,
    isDemoMode,
    isDemoExpired,
    
    // Refs
    hrToolsMenuRef,
    accountMenuRef,
    userMenuRef,
    
    // Computed values
    companySlug,
    buildLink,
    
    // Functions
    handleLogin,
    handleLogout,
    formatTime,
  };
};
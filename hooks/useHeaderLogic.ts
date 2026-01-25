// hooks/useHeaderLogic.ts
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { RefObject } from 'react';
import { supabase } from '../lib/supabaseClient'; // 🆕 Import shared client instead of creating new one

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
  
  // 🆕 New state for session management
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  
  // 🆕 Refs to track manual auth operations
  const isManualLoginInProgress = useRef(false);
  const isManualLogoutInProgress = useRef(false);

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
    try {
      console.log('🔍 Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('id, user_firstname, user_lastname, is_admin, is_super_admin, is_manager')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('❌ Error fetching user profile:', error);
        return;
      }
      
      if (data) {
        console.log('✅ User profile loaded:', data.user_firstname, data.user_lastname);
        setUser({ 
          id: data.id, 
          firstname: data.user_firstname, 
          lastname: data.user_lastname, 
          is_admin: data.is_admin, 
          is_super_admin: data.is_super_admin, 
          is_manager: data.is_manager 
        });
      }
    } catch (err) {
      console.error('❌ Exception fetching user profile:', err);
    }
  }, []);

  const fetchUserCompanyId = useCallback(async (userId: string) => {
    try {
      console.log('🔍 Fetching company ID for user:', userId);
      const { data, error } = await supabase
        .from('company_to_users')
        .select('company_id')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('❌ Error fetching company ID:', error);
        return;
      }
      
      if (data?.company_id) {
        console.log('✅ Company ID loaded:', data.company_id);
        setCompanyId(data.company_id);
      }
    } catch (err) {
      console.error('❌ Exception fetching company ID:', err);
    }
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

  // 🆕 Session cleanup function - clears invalid sessions
  const cleanupInvalidSession = useCallback(async () => {
    console.log('🧹 Cleaning up invalid session...');
    await supabase.auth.signOut();
    setUser(null);
    setCompanyId(null);
  }, []);

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
  // 🆕 Effect to auto-close login modal when user is restored from session
  useEffect(() => {
    // Only auto-close the modal if user is logged in AND session was restored (not manual login)
    // We know it's a restored session if the modal is open but we have a user without manual login in progress
    if (user && isLoginOpen && isSessionChecked && !isManualLoginInProgress.current && !isManualLogoutInProgress.current) {
      console.log('👤 User session restored, closing login modal');
      setIsLoginOpen(false);
    }
  }, [user, isLoginOpen, isSessionChecked]);

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
    
    try {
      console.log('🔑 Attempting login...');
      
      // 🆕 Set flag to prevent auth listener from interfering
      isManualLoginInProgress.current = true;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      
      if (error) {
        console.error('❌ Login error:', error);
        setError('Invalid email or password!');
        isManualLoginInProgress.current = false;
        return;
      }
      
      if (data.user) {
        console.log('✅ Login successful, user:', data.user.id);
        
        // Fetch user data with individual try-catch
        console.log('📊 Starting to fetch user data...');
        
        try {
          await fetchUserProfile(data.user.id);
          console.log('✅ Profile fetch returned');
        } catch (profileError) {
          console.error('❌ Profile fetch failed:', profileError);
        }
        
        try {
          await fetchUserCompanyId(data.user.id);
          console.log('✅ Company fetch returned');
        } catch (companyError) {
          console.error('❌ Company fetch failed:', companyError);
        }
        
        console.log('✅ User data fetch complete');
        
        // Close modal after data is loaded
        console.log('🚪 Closing login modal');
        setIsLoginOpen(false);
        
        // Clear the flag
        setTimeout(() => {
          isManualLoginInProgress.current = false;
        }, 500);
        
        // Navigate to home
        const homeUrl = companySlug ? `/jobs/${companySlug}` : '/';
        console.log('🏠 Navigating to:', homeUrl);
        router.push(homeUrl);
      }
    } catch (err) {
      console.error('❌ Unexpected error during login:', err);
      setError('An unexpected error occurred. Please try again.');
      isManualLoginInProgress.current = false;
    }
  }, [login, password, companySlug, router, fetchUserProfile, fetchUserCompanyId, isDemoExpired]);

  const handleLogout = useCallback(async () => {
    try {
      console.log('🚪 Logging out...');
      
      // 🆕 Set flag to prevent auth listener from interfering
      isManualLogoutInProgress.current = true;
      
      const homeUrl = companySlug ? `/jobs/${companySlug}` : '/';
      console.log('Logout - homeUrl:', homeUrl);
      
      // 🆕 FIRST: Clear localStorage BEFORE calling signOut
      // Find and remove all Supabase auth keys (they start with 'sb-')
      console.log('🧹 Clearing localStorage auth keys...');
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.startsWith('supabase'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log('🗑️ Removed:', key);
      });
      
      // Now sign out from Supabase (with timeout in case it hangs)
      console.log('📤 Calling Supabase signOut...');
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SignOut timeout')), 3000)
      );
      
      try {
        await Promise.race([signOutPromise, timeoutPromise]);
        console.log('✅ Supabase signOut successful');
      } catch (error) {
        console.warn('⚠️ SignOut timed out or failed:', error);
        // Continue anyway since we already cleared localStorage
      }
      
      // Clear user state immediately
      console.log('🧹 Clearing user state...');
      setUser(null);
      setCompanyId(null);
      
      console.log('✅ User state cleared');
      console.log('📍 Redirecting to:', homeUrl);
      
      // Redirect to home
      router.push(homeUrl);
      
      // Clear the flag after redirect
      setTimeout(() => {
        isManualLogoutInProgress.current = false;
        console.log('🏁 Logout complete');
      }, 1000);
      
    } catch (error) {
      console.error('❌ Unexpected error during logout:', error);
      
      // Force clear everything even on error
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.startsWith('supabase'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      setUser(null);
      setCompanyId(null);
      isManualLogoutInProgress.current = false;
      
      // Try to redirect anyway
      const homeUrl = companySlug ? `/jobs/${companySlug}` : '/';
      router.push(homeUrl);
    }
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

  // 🆕 MAIN SESSION MANAGEMENT EFFECT - This is the core fix!
  useEffect(() => {
    let mounted = true;
    let authListenerSubscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing auth state...');
        
        // Step 1: Get current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          await cleanupInvalidSession();
          setIsSessionChecked(true);
          return;
        }

        // Step 2: Check if session exists and is valid
        if (session?.user) {
          console.log('✅ Valid session found, user:', session.user.id);
          
          // Session exists - fetch user data
          if (mounted) {
            await fetchUserProfile(session.user.id);
            await fetchUserCompanyId(session.user.id);
          }
        } else {
          console.log('ℹ️ No active session found');
          // No session - ensure user state is cleared
          if (mounted) {
            setUser(null);
          }
        }

        if (mounted) {
          setIsSessionChecked(true);
        }

      } catch (err) {
        console.error('❌ Error during auth initialization:', err);
        await cleanupInvalidSession();
        if (mounted) {
          setIsSessionChecked(true);
        }
      }
    };

    // Initialize auth on mount
    initializeAuth();

    // 🆕 Set up auth state change listener with enhanced error handling
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);

      if (!mounted) return;

      // 🆕 Skip handling events if we're in the middle of a manual auth operation
      if (event === 'SIGNED_IN' && isManualLoginInProgress.current) {
        console.log('⏭️ Skipping SIGNED_IN event (manual login in progress)');
        return;
      }

      if (event === 'SIGNED_OUT' && isManualLogoutInProgress.current) {
        console.log('⏭️ Skipping SIGNED_OUT event (manual logout in progress)');
        return;
      }

      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          console.log('✅ User signed in (via auth listener)');
          if (session?.user) {
            await fetchUserProfile(session.user.id);
            await fetchUserCompanyId(session.user.id);
          }
          break;

        case 'SIGNED_OUT':
          console.log('👋 User signed out (via auth listener)');
          setUser(null);
          setCompanyId(null);
          break;

        case 'TOKEN_REFRESHED':
          console.log('🔄 Token refreshed successfully');
          // Token was refreshed automatically - session is still valid
          if (session?.user) {
            // Optionally re-fetch user data
            await fetchUserProfile(session.user.id);
            await fetchUserCompanyId(session.user.id);
          }
          break;

        case 'USER_UPDATED':
          console.log('🔄 User data updated');
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          }
          break;

        case 'INITIAL_SESSION':
          // Skip - already handled by initializeAuth
          console.log('ℹ️ Initial session event (skipped)');
          break;

        default:
          // For any other event, validate the session
          if (session?.user) {
            await fetchUserProfile(session.user.id);
            await fetchUserCompanyId(session.user.id);
          } else {
            setUser(null);
            setCompanyId(null);
          }
      }

      // Always fetch company logo if we have a slug
      if (companySlug) {
        await fetchCompanyLogoAndId(companySlug);
      }
    });

    authListenerSubscription = authListener.subscription;

    // Fetch company data on mount
    if (companySlug) {
      fetchCompanyLogoAndId(companySlug);
    }

    // Cleanup
    return () => {
      mounted = false;
      if (authListenerSubscription) {
        authListenerSubscription.unsubscribe();
      }
    };
  }, [companySlug, fetchUserProfile, fetchUserCompanyId, fetchCompanyLogoAndId, cleanupInvalidSession]);

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
import { createContext, useContext, useReducer, useCallback } from 'react';

/**
 * Central UI state for the dashboard (filters, tab, sort, pagination).
 * Components dispatch intent; they never hold this state locally. This keeps
 * the table, pills and filter bar in sync from one source of truth.
 */
const initialState = {
  tab: 'bookings', // bookings | deleted | approval
  approvalStatus: 'all', // all | pending | approved | rejected
  bookingDateStart: '',
  bookingDateEnd: '',
  travelDateStart: '',
  travelDateEnd: '',
  owner: '',
  type: 'All Bookings',
  search: '',
  showIncomplete: false,
  sortBy: '', // amount | travelDate
  sortOrder: 'desc',
  page: 1,
  limit: 6,
};

// Fields that, when changed, should reset pagination back to page 1.
const RESET_PAGE_FIELDS = new Set([
  'tab', 'approvalStatus', 'bookingDateStart', 'bookingDateEnd',
  'travelDateStart', 'travelDateEnd', 'owner', 'type', 'search',
  'showIncomplete', 'sortBy', 'sortOrder', 'limit',
]);

function reducer(state, action) {
  switch (action.type) {
    case 'SET': {
      const next = { ...state, [action.field]: action.value };
      if (RESET_PAGE_FIELDS.has(action.field)) next.page = 1;
      return next;
    }
    case 'SET_PAGE':
      return { ...state, page: action.value };
    case 'TOGGLE_SORT': {
      // Cycle: none -> desc -> asc -> none for the clicked column.
      if (state.sortBy !== action.field)
        return { ...state, sortBy: action.field, sortOrder: 'desc', page: 1 };
      if (state.sortOrder === 'desc')
        return { ...state, sortOrder: 'asc', page: 1 };
      return { ...state, sortBy: '', sortOrder: 'desc', page: 1 };
    }
    case 'RESET':
      return { ...initialState, tab: state.tab };
    default:
      return state;
  }
}

const FiltersContext = createContext(null);

export function FiltersProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const set = useCallback((field, value) => dispatch({ type: 'SET', field, value }), []);
  const setPage = useCallback((value) => dispatch({ type: 'SET_PAGE', value }), []);
  const toggleSort = useCallback((field) => dispatch({ type: 'TOGGLE_SORT', field }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return (
    <FiltersContext.Provider value={{ filters: state, set, setPage, toggleSort, reset }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error('useFilters must be used within FiltersProvider');
  return ctx;
}

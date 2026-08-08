import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';
import { setActiveOrganization } from '../../store/authSlice';
import { useGetUserOrganizationsQuery } from '../../services/organizationApi';
import { Building2, ChevronDown, Plus, Check } from 'lucide-react';
import { CreateOrganizationModal } from './CreateOrganizationModal';

export const OrganizationSwitcher: React.FC = () => {
  const dispatch = useDispatch();
  const activeOrgId = useSelector((state: RootState) => state.auth.activeOrganizationId);
  const { data, isLoading } = useGetUserOrganizationsQuery();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const orgs = data?.data?.organizations || [];
  const activeOrgObj = orgs.find(
    (item) => (item.organization.id || item.organization._id) === activeOrgId
  )?.organization || orgs[0]?.organization;

  // Auto-select first org if activeOrgId is not set
  React.useEffect(() => {
    if (!activeOrgId && orgs.length > 0) {
      const firstId = orgs[0].organization.id || orgs[0].organization._id;
      dispatch(setActiveOrganization(firstId));
    }
  }, [activeOrgId, orgs, dispatch]);

  if (isLoading) {
    return <div className="h-9 w-40 bg-slate-800 animate-pulse rounded-xl" />;
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center justify-between w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-200 hover:bg-slate-800 transition-colors text-xs font-semibold"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {activeOrgObj?.logoUrl ? (
                <img
                  src={activeOrgObj.logoUrl}
                  alt={activeOrgObj.name}
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <Building2 className="w-3.5 h-3.5" />
              )}
            </div>
            <span className="truncate font-bold">{activeOrgObj?.name || 'Select Workspace'}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
        </button>

        {dropdownOpen && (
          <div
            className="absolute left-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 space-y-1"
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1.5">
              Workspaces ({orgs.length})
            </div>

            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {orgs.map((item) => {
                const orgId = item.organization.id || item.organization._id;
                const isSelected = orgId === activeOrgId;
                return (
                  <button
                    key={orgId}
                    onClick={() => {
                      dispatch(setActiveOrganization(orgId));
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isSelected ? 'bg-brand-600/20 text-brand-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{item.organization.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setDropdownOpen(false);
                setCreateModalOpen(true);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-brand-400 hover:bg-brand-950/40 rounded-lg border-t border-slate-800 pt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Create New Organization
            </button>
          </div>
        )}
      </div>

      <CreateOrganizationModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </>
  );
};

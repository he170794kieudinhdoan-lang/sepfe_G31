import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  getTermsCondition,
  updateTermsCondition,
} from '@/features/terms/api/termsApi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { Modal } from '@/shared/components/Modal';
import { DashboardLayout } from '@/shared/components/Layout/DashboardLayout';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';
import { SectorManagementService } from '@/features/jobs/api/sectormanagement';
import { OccupationManagementService } from '@/features/jobs/api/occupationmanagement';
import { useGetAiWeights, useUpdateAiWeights } from '@/features/jobs';
import { useGetAllUsersPaginated, useUpdateUserStatus } from '@/features/users/api/useUser';
import { AppPagination } from '@/shared/components/AppPagination';

const kpi = [
  { label: 'Total users', value: '12,540' },
  { label: 'Total employers', value: '1,240' },
  { label: 'Total companies', value: '860' },
  { label: 'Total job postings', value: '4,520' },
];

export const AdminDashboard = () => {
  const { toast } = useToast();
  const [active, setActive] = useState('overview');

  // Users state
  const initialUserFilters = {
    page: 1,
    role: '',
    status: '',
    fromDate: '',
    toDate: '',
  };

  const [userFilters, setUserFilters] = useState(initialUserFilters);
  const [userFiltersInput, setUserFiltersInput] = useState(initialUserFilters);

  const { data: usersData, isLoading: isLoadingUsers } = useGetAllUsersPaginated(userFilters);
  const usersList = usersData?.data || [];
  const totalPages = usersData?.totalPages || 1;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userStatusToUpdate, setUserStatusToUpdate] = useState(null);
  const updateUserStatusMutation = useUpdateUserStatus();
  const [sectorModal, setSectorModal] = useState(false);
  const [editSector, setEditSector] = useState(null);
  const [sectorToDelete, setSectorToDelete] = useState(null);
  const [termsEditMode, setTermsEditMode] = useState(false);
  const [termsSaved, setTermsSaved] = useState({
    id: null,
    title: '',
    content: '',
  });
  const [termsDraft, setTermsDraft] = useState({
    id: null,
    title: '',
    content: '',
  });
  const [isTermsLoading, setIsTermsLoading] = useState(false);
  const [sectorName, setSectorName] = useState('');
  const [sectors, setSectors] = useState([]);
  const [loadingSectors, setLoadingSectors] = useState(false);

  // Occupations state
  const [occupations, setOccupations] = useState([]);
  const [loadingOccupations, setLoadingOccupations] = useState(false);
  const [occupationModal, setOccupationModal] = useState(false);
  const [editOccupation, setEditOccupation] = useState(null);
  const [occupationToDelete, setOccupationToDelete] = useState(null);
  const [occupationName, setOccupationName] = useState('');
  const [selectedSectorId, setSelectedSectorId] = useState('');
  const [filterSectorId, setFilterSectorId] = useState('');

  // AI Matching Weights State
  const { data: weightsData, isLoading: loadingWeights } = useGetAiWeights();
  const updateWeightsMutation = useUpdateAiWeights();
  const [aiWeights, setAiWeights] = useState({});

  const [aiLabels, setAiLabels] = useState({});

  useEffect(() => {
    if (weightsData && Array.isArray(weightsData)) {
      const newWeights = { ...aiWeights };
      const newLabels = { ...aiLabels };
      weightsData.forEach((item) => {
        newWeights[item.key] = Math.round(item.weight * 100);
        newLabels[item.key] = item.label;
      });
      setAiWeights(newWeights);
      setAiLabels(newLabels);
    }
  }, [weightsData]);

  const totalAiWeight = Object.values(aiWeights).reduce(
    (sum, val) => sum + Number(val),
    0,
  );

  const isLoading = false;

  const menu = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'users', label: 'Quản lý người dùng' },
    { key: 'sectors', label: 'Quản lý ngành nghề' },
    { key: 'occupations', label: 'Quản lý nghề nghiệp' },
    { key: 'stats', label: 'Thống kê hệ thống' },
    { key: 'terms', label: 'Điều khoản' },
    { key: 'ai_weights', label: 'Cấu hình AI' },
  ];

  const fetchSectors = async () => {
    try {
      setLoadingSectors(true);

      const sectors = await SectorManagementService.getAllSectors();
      setSectors(sectors);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSectors(false);
    }
  };

  useEffect(() => {
    fetchSectors();
  }, []);
  const createSector = async () => {
    try {
      if (!sectorName.trim()) {
        toast('Tên ngành nghề không được để trống', 'error');
        return;
      }

      await SectorManagementService.createSector({
        name: sectorName,
      });

      // cập nhật list sector ngay lập tức
      await fetchSectors();

      toast('Tạo ngành nghề thành công');

      setSectorModal(false);
      setSectorName('');
    } catch (e) {
      console.error(e);
      toast('Tạo ngành nghề thất bại', 'error');
    }
  };
  const updateSector = async () => {
    try {
      if (!sectorName.trim()) {
        toast('Tên ngành nghề không được để trống', 'error');
        return;
      }

      if (!editSector) return;

      await SectorManagementService.updateSector(editSector.id, {
        name: sectorName,
      });

      toast('Cập nhật ngành nghề thành công');

      setSectorModal(false);
      setEditSector(null);
      setSectorName('');

      await fetchSectors();
    } catch (e) {
      console.error(e);
      toast('Cập nhật ngành nghề thất bại', 'error');
    }
  };
  const deleteSector = async () => {
    try {
      if (!sectorToDelete) return;

      await SectorManagementService.deleteSector(sectorToDelete.id);

      toast('Xóa ngành nghề thành công');

      setSectorToDelete(null);

      await fetchSectors();
    } catch (e) {
      console.error(e);
      toast('Xóa ngành nghề thất bại', 'error');
    }
  };

  const fetchOccupations = async (sectorId = '') => {
    try {
      setLoadingOccupations(true);
      let data;
      if (sectorId) {
        data =
          await OccupationManagementService.getActiveOccupationBySector(
            sectorId,
          );
      } else {
        data = await OccupationManagementService.getAllActiveOccupations();
      }

      let arr = [];
      if (Array.isArray(data)) arr = data;
      else if (data?.data && Array.isArray(data.data)) arr = data.data;
      else if (data?.content && Array.isArray(data.content)) arr = data.content;
      else if (data?.data?.data && Array.isArray(data.data.data))
        arr = data.data.data;

      setOccupations(arr);
    } catch (e) {
      console.error(e);
      toast('Lỗi khi tải danh sách nghề nghiệp', 'error');
    } finally {
      setLoadingOccupations(false);
    }
  };

  useEffect(() => {
    if (active === 'occupations') {
      fetchOccupations(filterSectorId);
    }
  }, [active, filterSectorId]);

  const createOccupation = async () => {
    try {
      if (!occupationName.trim() || !selectedSectorId) {
        toast('Vui lòng nhập đầy đủ tên và chọn ngành nghề', 'error');
        return;
      }
      await OccupationManagementService.createOccupation({
        name: occupationName,
        sectorId: selectedSectorId,
      });
      await fetchOccupations(filterSectorId);
      toast('Tạo nghề nghiệp thành công');
      setOccupationModal(false);
      setOccupationName('');
      setSelectedSectorId('');
    } catch (e) {
      console.error(e);
      toast('Tạo nghề nghiệp thất bại', 'error');
    }
  };

  const updateOccupation = async () => {
    try {
      if (!occupationName.trim() || !selectedSectorId) {
        toast('Vui lòng nhập đầy đủ tên và chọn ngành nghề', 'error');
        return;
      }
      if (!editOccupation) return;
      await OccupationManagementService.updateOccupation(editOccupation.id, {
        name: occupationName,
        sectorId: selectedSectorId,
      });
      toast('Cập nhật nghề nghiệp thành công');
      setOccupationModal(false);
      setEditOccupation(null);
      setOccupationName('');
      setSelectedSectorId('');
      await fetchOccupations(filterSectorId);
    } catch (e) {
      console.error(e);
      toast('Cập nhật nghề nghiệp thất bại', 'error');
    }
  };

  const deleteOccupation = async () => {
    try {
      if (!occupationToDelete) return;
      await OccupationManagementService.deleteOccupation(occupationToDelete.id);
      toast('Xóa nghề nghiệp thành công');
      setOccupationToDelete(null);
      await fetchOccupations(filterSectorId);
    } catch (e) {
      console.error(e);
      toast('Xóa nghề nghiệp thất bại', 'error');
    }
  };

  useEffect(() => {
    if (active === 'terms') {
      const fetchTerms = async () => {
        setIsTermsLoading(true);
        try {
          const data = await getTermsCondition();
          // Lấy phần tử đầu tiên nếu data là một mảng
          const termsData = Array.isArray(data) ? data[0] : data;

          if (termsData) {
            setTermsSaved({
              id: termsData?.id,
              title: termsData?.title || '',
              content: termsData?.content || '',
            });
            setTermsDraft({
              id: termsData?.id,
              title: termsData?.title || '',
              content: termsData?.content || '',
            });
          }
        } catch (error) {
          toast('Không thể tải điều khoản', 'error');
        } finally {
          setIsTermsLoading(false);
        }
      };

      fetchTerms();
    }
  }, [active, toast]);

  const handleSaveTerms = async () => {
    if (!termsDraft.id) {
      toast('Không tìm thấy ID điều khoản để cập nhật', 'error');
      return;
    }

    setIsTermsLoading(true);
    try {
      await updateTermsCondition(termsDraft.id, {
        title: termsDraft.title,
        content: termsDraft.content,
      });
      setTermsSaved(termsDraft);
      setTermsEditMode(false);
      toast('Đã lưu điều khoản.');
    } catch (error) {
      toast('Lưu điều khoản thất bại', 'error');
    } finally {
      setIsTermsLoading(false);
    }
  };

  console.log(weightsData);

  return (
    <DashboardLayout
      title="Admin Dashboard"
      menu={menu}
      activeKey={active}
      onSelect={setActive}
      topbarBell={<NotificationBellPopover />}
    >
      {active === 'overview' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpi.map((item) => (
              <Card key={item.label} className="p-5">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold mt-2">{item.value}</p>
              </Card>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Chart hệ thống</h3>
                <Badge variant="outline">Placeholder</Badge>
              </div>
              <div className="h-60 rounded-xl bg-gradient-to-br from-primary/10 via-white to-primary-muted/30 border border-dashed flex items-center justify-center text-muted-foreground">
                Chart placeholder
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Summary</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>New users (7 days)</span>
                  <span className="font-semibold text-foreground">+420</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Companies pending</span>
                  <span className="font-semibold text-foreground">18</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reports unresolved</span>
                  <span className="font-semibold text-foreground">12</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {active === 'users' && (
        <div className="space-y-6">
          <Card className="p-4 flex flex-wrap gap-3 items-center">
            <select
              className="rounded-full border px-4 py-2 text-sm bg-white outline-none"
              value={userFiltersInput.role}
              onChange={(e) => setUserFiltersInput({ ...userFiltersInput, role: e.target.value })}
            >
              <option value="">Role</option>
              <option value="WORKER">Worker</option>
              <option value="EMPLOYER">Employer</option>
              <option value="MANAGER">Manager</option>
            </select>
            <select
              className="rounded-full border px-4 py-2 text-sm bg-white outline-none"
              value={userFiltersInput.status}
              onChange={(e) => setUserFiltersInput({ ...userFiltersInput, status: e.target.value })}
            >
              <option value="">Status</option>
              <option value="ACTIVE">Active</option>
              <option value="DELETED">Disabled</option>
            </select>
            <Input
              type="date"
              className="max-w-[180px] rounded-full"
              value={userFiltersInput.fromDate}
              onChange={(e) => setUserFiltersInput({ ...userFiltersInput, fromDate: e.target.value })}
            />
            <Input
              type="date"
              className="max-w-[180px] rounded-full"
              value={userFiltersInput.toDate}
              onChange={(e) => setUserFiltersInput({ ...userFiltersInput, toDate: e.target.value })}
            />
            <Button
              className="rounded-full px-6"
              onClick={() => {
                const newFilters = { ...userFiltersInput, page: 1 };
                setUserFilters(newFilters);
                setUserFiltersInput(newFilters);
              }}
            >
              Lọc
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-6"
              onClick={() => {
                setUserFiltersInput(initialUserFilters);
                setUserFilters(initialUserFilters);
              }}
            >
              Reset
            </Button>
          </Card>

          {isLoadingUsers ? (
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          ) : usersList.length === 0 ? (
            <EmptyState
              title={MSG.MSG_USER_LIST_EMPTY || "Danh sách trống"}
              description="Danh sách người dùng đang trống hoặc không có kết quả phù hợp."
            />
          ) : (
            <Card className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr className="border-b">
                      <th className="py-2 font-medium">Name</th>
                      <th className="font-medium">Email</th>
                      <th className="font-medium">Role</th>
                      <th className="font-medium">Status</th>
                      <th className="font-medium">Created date</th>
                      <th className="font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((user) => (
                      <tr key={user.id} className="border-b last:border-b-0 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-800">{user.name}</td>
                        <td className="text-slate-600">{user.email}</td>
                        <td className="capitalize text-slate-600">{user.role?.toLowerCase() || ''}</td>
                        <td>
                          <Badge
                            variant={
                              user.status === 'ACTIVE' ? 'default' : 'secondary'
                            }
                            className={user.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : ""}
                          >
                            {user.status === 'ACTIVE' ? 'Active' : 'Disabled'}
                          </Badge>
                        </td>
                        <td className="text-slate-600">
                          {user.createdDate ? new Date(user.createdDate).toLocaleDateString() : ''}
                        </td>
                        <td>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full shadow-sm"
                            onClick={() => {
                              setUserStatusToUpdate({
                                id: user.id,
                                name: user.name,
                                status: user.status === 'ACTIVE' ? 'DELETED' : 'ACTIVE'
                              });
                              setConfirmOpen(true);
                            }}
                          >
                            {user.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <AppPagination
                page={userFilters.page}
                totalPage={totalPages}
                onPageChange={(page) => {
                  setUserFilters({ ...userFilters, page });
                  setUserFiltersInput({ ...userFiltersInput, page });
                }}
              />
            </Card>
          )}
        </div>
      )}

      {active === 'sectors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Quản lý ngành nghề</h2>
            <Button
              className="rounded-xl"
              onClick={() => {
                setSectorModal(true);
                setEditSector(null);
                setSectorName('');
              }}
            >
              Tạo ngành nghề
            </Button>
          </div>
          <Card className="p-4">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Sector name</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingSectors ? (
                  <tr>
                    <td colSpan="3" className="text-center py-6">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ) : sectors.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-6 text-muted-foreground"
                    >
                      Không có ngành nghề
                    </td>
                  </tr>
                ) : (
                  sectors.map((sector) => (
                    <tr key={sector.id} className="border-b last:border-b-0">
                      <td className="py-3 font-semibold">{sector.name}</td>
                      <td>{new Date(sector.createdAt).toLocaleDateString()}</td>
                      <td className="flex gap-2 py-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => {
                            setEditSector(sector);
                            setSectorName(sector.name);
                            setSectorModal(true);
                          }}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setSectorToDelete(sector)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {active === 'occupations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Quản lý nghề nghiệp</h2>
            <div className="flex gap-4">
              <select
                className="rounded-xl border px-4 py-2 text-sm bg-white"
                value={filterSectorId}
                onChange={(e) => setFilterSectorId(e.target.value)}
              >
                <option value="">Tất cả ngành nghề</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
              <Button
                className="rounded-xl"
                onClick={() => {
                  setOccupationModal(true);
                  setEditOccupation(null);
                  setOccupationName('');
                  setSelectedSectorId(filterSectorId || '');
                }}
              >
                Tạo nghề nghiệp
              </Button>
            </div>
          </div>
          <Card className="p-4">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Tên nghề nghiệp</th>
                  <th>Ngành nghề (Sector)</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loadingOccupations ? (
                  <tr>
                    <td colSpan="4" className="text-center py-6">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ) : occupations.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-6 text-muted-foreground"
                    >
                      Không có nghề nghiệp
                    </td>
                  </tr>
                ) : (
                  occupations.map((occ) => {
                    const sector = sectors.find(
                      (s) => s.id == (occ.sectorId || occ.sector?.id),
                    ) || { name: 'Unknown' };
                    return (
                      <tr key={occ.id} className="border-b last:border-b-0">
                        <td className="py-3 font-semibold">{occ.name}</td>
                        <td>
                          <Badge variant="outline">{sector.name}</Badge>
                        </td>
                        <td className="flex gap-2 py-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => {
                              setEditOccupation(occ);
                              setOccupationName(occ.name);
                              setSelectedSectorId(
                                String(occ.sectorId || occ.sector?.id || ''),
                              );
                              setOccupationModal(true);
                            }}
                          >
                            Edit
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-full"
                            onClick={() => setOccupationToDelete(occ)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {active === 'stats' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpi.map((item) => (
              <Card key={item.label} className="p-5">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold mt-2">{item.value}</p>
              </Card>
            ))}
          </div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Thống kê theo role</h3>
              <Badge variant="outline">Placeholder</Badge>
            </div>
            {isLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <div className="h-52 rounded-xl bg-slate-100 border border-dashed flex items-center justify-center text-muted-foreground">
                Chart placeholder
              </div>
            )}
          </Card>
          {false && (
            <EmptyState
              title={MSG.MSG_STATS_EMPTY}
              description="Chưa có dữ liệu hệ thống."
            />
          )}
        </div>
      )}

      {active === 'ai_weights' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Cấu hình Trọng số AI Matching
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Điều chỉnh phân bổ tỷ trọng phần trăm (thống nhất 100%) của các
                tiêu chí quét ứng viên.
              </p>
            </div>
            <Button
              className="rounded-xl px-6"
              onClick={() => {
                if (totalAiWeight !== 100) {
                  toast('Tổng trọng số phải chuẩn bằng 100%', 'error');
                  return;
                }
                const payload = Object.entries(aiWeights).map(([key, val]) => ({
                  key,
                  weight: Number(val) / 100,
                }));
                updateWeightsMutation.mutate(payload);
              }}
              disabled={updateWeightsMutation.isPending}
            >
              {updateWeightsMutation.isPending ? 'Đang lưu...' : 'Lưu cấu hình'}
            </Button>
          </div>

          {loadingWeights ? (
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          ) : (
            <Card className="p-8 shadow-sm rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
                {Object.keys(aiWeights).map((key) => (
                  <div key={key} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700">
                        {aiLabels[key] || key}
                      </span>
                      <span className="text-primary font-bold text-lg">
                        {aiWeights[key]}%
                      </span>
                    </div>
                    <Input
                      type="number"
                      className="w-full"
                      min="0"
                      max="100"
                      value={aiWeights[key]}
                      onChange={(e) =>
                        setAiWeights({
                          ...aiWeights,
                          [key]:
                            e.target.value === '' ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              <div
                className={`mt-12 p-6 border rounded-xl flex items-center justify-between transition-colors ${totalAiWeight === 100 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}
              >
                <span className="font-semibold text-slate-800 text-lg">
                  Tổng trọng số:
                </span>
                <span
                  className={`text-3xl font-bold ${totalAiWeight === 100 ? 'text-emerald-600' : 'text-rose-600'}`}
                >
                  {totalAiWeight}%
                </span>
              </div>
              {totalAiWeight !== 100 && (
                <p className="text-rose-500 text-sm mt-3 animate-pulse">
                  * Tổng các trọng số hiện tại là {totalAiWeight}%. Vui lòng
                  điều chỉnh lại cho tròn 100% để bộ học hoạt động tốt.
                </p>
              )}
            </Card>
          )}
        </div>
      )}

      {active === 'terms' && (
        <div className="space-y-6">
          <Card className="p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              Điều khoản & điều kiện
            </h3>
            {isTermsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-96 w-full" />
              </div>
            ) : termsEditMode ? (
              <div className="space-y-4">
                <Input
                  className="text-lg font-medium p-4 h-14 rounded-xl"
                  placeholder="Tiêu đề"
                  value={termsDraft.title}
                  onChange={(e) =>
                    setTermsDraft({ ...termsDraft, title: e.target.value })
                  }
                />
                <textarea
                  className="w-full min-h-[500px] rounded-xl border p-6 text-base leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono shadow-sm bg-slate-50/50"
                  placeholder="Nội dung điều khoản..."
                  value={termsDraft.content}
                  onChange={(e) =>
                    setTermsDraft({ ...termsDraft, content: e.target.value })
                  }
                />
                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    className="rounded-xl px-6"
                    onClick={() => {
                      setTermsDraft(termsSaved);
                      setTermsEditMode(false);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button className="rounded-xl px-8" onClick={handleSaveTerms}>
                    Lưu thay đổi
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full space-y-4">
                <div className="flex-1 bg-slate-50/50 rounded-2xl border p-8 shadow-sm">
                  <h4 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-4">
                    {termsSaved.title || 'Chưa có tiêu đề'}
                  </h4>
                  <div className="min-h-[400px] text-base text-slate-700 whitespace-pre-wrap leading-loose">
                    {termsSaved.content || 'Chưa có nội dung'}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="lg"
                    className="rounded-xl px-8 mt-2 shadow-sm"
                    onClick={() => {
                      setTermsDraft(termsSaved);
                      setTermsEditMode(true);
                    }}
                  >
                    Chỉnh sửa điều khoản
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      <Modal
        open={confirmOpen}
        title="Xác nhận thay đổi"
        description={`Bạn chắc chắn muốn ${userStatusToUpdate?.status === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản của ${userStatusToUpdate?.name || 'người dùng này'}?`}
        onClose={() => {
          setConfirmOpen(false);
          setUserStatusToUpdate(null);
        }}
        onConfirm={async () => {
          if (!userStatusToUpdate) return;
          try {
            await updateUserStatusMutation.mutateAsync({
              userId: userStatusToUpdate.id,
              status: userStatusToUpdate.status
            });
            toast(`Đã ${userStatusToUpdate.status === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản thành công`);
            setConfirmOpen(false);
            setUserStatusToUpdate(null);
          } catch (error) {
            toast('Lỗi khi cập nhật trạng thái', 'error');
          }
        }}
        confirmLabel={updateUserStatusMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
        confirmDisabled={updateUserStatusMutation.isPending}
      />

      <Modal
        open={sectorModal}
        title={editSector ? 'Cập nhật ngành nghề' : 'Tạo ngành nghề'}
        description="Nhập tên ngành nghề"
        onClose={() => {
          setSectorModal(false);
          setEditSector(null);
          setSectorName('');
        }}
        onConfirm={() => {
          if (editSector) {
            updateSector();
          } else {
            createSector();
          }
        }}
        confirmLabel="Lưu"
      >
        <Input
          placeholder="Tên ngành nghề"
          value={sectorName}
          onChange={(e) => setSectorName(e.target.value)}
          className="rounded-xl"
        />
      </Modal>

      <Modal
        open={!!sectorToDelete}
        title="Xóa ngành nghề"
        description="Bạn chắc chắn muốn xóa ngành nghề này?"
        onClose={() => setSectorToDelete(null)}
        onConfirm={deleteSector}
        confirmLabel="Xóa"
        tone="danger"
      />

      <Modal
        open={occupationModal}
        title={editOccupation ? 'Cập nhật nghề nghiệp' : 'Tạo nghề nghiệp'}
        description="Nhập tên nghề nghiệp và chọn ngành nghề tương ứng."
        onClose={() => {
          setOccupationModal(false);
          setEditOccupation(null);
          setOccupationName('');
          setSelectedSectorId('');
        }}
        onConfirm={() => {
          if (editOccupation) {
            updateOccupation();
          } else {
            createOccupation();
          }
        }}
        confirmLabel="Lưu"
      >
        <div className="space-y-4 pt-2">
          <select
            className="w-full rounded-xl border px-4 py-2 text-sm bg-white"
            value={selectedSectorId}
            onChange={(e) => setSelectedSectorId(e.target.value)}
          >
            <option value="">-- Chọn ngành nghề --</option>
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </select>
          <Input
            placeholder="Tên nghề nghiệp"
            value={occupationName}
            onChange={(e) => setOccupationName(e.target.value)}
            className="rounded-xl"
          />
        </div>
      </Modal>

      <Modal
        open={!!occupationToDelete}
        title="Xóa nghề nghiệp"
        description={`Bạn chắc chắn muốn xóa nghề nghiệp "${occupationToDelete?.name}"? Hành động này không thể hoàn tác.`}
        onClose={() => setOccupationToDelete(null)}
        onConfirm={deleteOccupation}
        confirmLabel="Xóa"
        tone="danger"
      />
    </DashboardLayout>
  );
};

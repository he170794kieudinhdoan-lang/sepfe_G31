import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useUpdateJob } from "@/features/jobs/useJobMutation"
import { useJobDetail } from "@/features/jobs/api/useJobs"
import { useToast } from "@/shared/contexts/ToastContext"
import { apiClient } from "@/shared/api/apiClient"
import { useProvinces } from "@/shared/hooks/useProvinces"
import { X } from "lucide-react"
export const EditJobPage = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const PROVINCES_API = import.meta.env.VITE_PROVINCES_API_URL;
  const { toast } = useToast();

  const steps = [
    "Ngành nghề & Thông tin",
    "Địa điểm & Ca làm",
    "Form ứng tuyển"
  ]
  const { data: jobDetail, isLoading } = useJobDetail(Number(jobId))
  const { mutate: updateJob, isPending } = useUpdateJob()
  const [currentStep, setCurrentStep] = useState(0)
  const [sectors, setSectors] = useState([])
  const [selectedSector, setSelectedSector] = useState("")
  const [loadingSector, setLoadingSector] = useState(false)
  const [occupations, setOccupations] = useState([])
  const [loadingOccupation, setLoadingOccupation] = useState(false)
  const { provinces, isLoading: loadingProvince } = useProvinces()
  const [districts, setDistricts] = useState([])
  const [loadingDistrict, setLoadingDistrict] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    occupationId: "",
    workingShift: "",
    quantity: "",
    genderRequirement: "",
    address: "",
    province: "",
    district: "",
    ageMin: "",
    ageMax: "",
    salaryMin: "",
    salaryMax: "",
    fields: []
  })
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {

    if (!jobDetail) return

    setForm({
      title: jobDetail.title,
      description: jobDetail.description,
      occupationId: jobDetail.occupationId,
      workingShift: jobDetail.workingShift,
      quantity: jobDetail.quantity,
      genderRequirement: jobDetail.genderRequirement || "",
      address: jobDetail.address || "",
      province: jobDetail.province || "",
      district: jobDetail.district || "",
      ageMin: jobDetail.ageMin || "",
      ageMax: jobDetail.ageMax || "",
      salaryMin: jobDetail.salaryMin || "",
      salaryMax: jobDetail.salaryMax || "",
      fields:
        jobDetail.applyForms?.[0]?.fields?.map(f => ({
          id: f.id,
          label: f.label,
          fieldType: f.fieldType,
          isRequired: f.isRequired,
          options:
            f.fieldType === "select" || f.fieldType === "radio" || f.fieldType === "checkbox"
              ? JSON.parse(f.options || "[]")
              : []
        })) || []
    })

    const foundSector = sectors.find(sector =>
      sector.occupations?.some(o => o.id === jobDetail.occupationId)
    )

    if (foundSector) {
      setSelectedSector(foundSector.id.toString())
    }
    console.log("jobDetail:", jobDetail)
    console.log("sectors:", sectors)
    console.log("form:", form)
    console.log("jobId:", jobId)
    console.log("jobDetail:", jobDetail)
    console.log("isLoading:", isLoading)
  }, [jobDetail, sectors])

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setLoadingSector(true)

        // apiClient đã có baseURL + unwrap data
        const data = await apiClient.get("/occupations/grouped-by-sector")

        setSectors(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Fetch sectors error:", err)
      } finally {
        setLoadingSector(false)
      }
    }

    fetchSectors()
  }, [])

  useEffect(() => {
    if (!selectedSector) {
      setOccupations([])
      return
    }

    const sector = sectors.find(
      (s) => s.id === Number(selectedSector)
    )

    setOccupations(sector?.occupations || [])

  }, [selectedSector, sectors])
  useEffect(() => {
    if (!form.province) {
      setDistricts([])
      return
    }

    const provinceObj = provinces.find(
      (p) => p.name === form.province
    )

    if (!provinceObj) return

    const fetchDistricts = async () => {
      try {
        setLoadingDistrict(true)
        const res = await fetch(
          `${PROVINCES_API}/p/${provinceObj.code}?depth=2`
        )
        const data = await res.json()
        setDistricts(data.districts || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingDistrict(false)
      }
    }

    fetchDistricts()
  }, [form.province, provinces])

  if (isLoading) return <div>Loading...</div>

  const handleSubmit = () => {
    const payload = {
      title: form.title,
      description: form.description,
      occupationId: Number(form.occupationId),
      workingShift: form.workingShift,
      quantity: Number(form.quantity),

      genderRequirement: form.genderRequirement || null,
      address: form.address || null,
      province: form.province || null,
      district: form.district || null,

      ageMin: form.ageMin !== "" && form.ageMin !== undefined && form.ageMin !== null ? Number(form.ageMin) : null,
      ageMax: form.ageMax !== "" && form.ageMax !== undefined && form.ageMax !== null ? Number(form.ageMax) : null,
      salaryMin: form.salaryMin !== "" && form.salaryMin !== undefined && form.salaryMin !== null ? Number(form.salaryMin) : null,
      salaryMax: form.salaryMax !== "" && form.salaryMax !== undefined && form.salaryMax !== null ? Number(form.salaryMax) : null,

      fields: form.fields.map(f => ({
        id: f.id, // nếu có
        label: f.label,
        fieldType: f.fieldType,
        isRequired: f.isRequired,
        options:
          f.fieldType === "select" || f.fieldType === "radio" || f.fieldType === "checkbox"
            ? JSON.stringify(
              f.options.filter(opt => opt.trim() !== "")
            )
            : undefined
      }))
    }

    updateJob({
      companyId: 1, // hard code tạm
      jobId: Number(jobId),
      payload
    }, {
      onSuccess: () => {
        toast("Cập nhật thành công", "success")
        navigate("/employer")
      },
      onError: (err) => {
        console.error("Lỗi cập nhật:", err);
        const message = err?.response?.data?.message || "Lỗi khi cập nhật tin. Vui lòng thử lại.";
        setErrorMessage(Array.isArray(message) ? message.join(", ") : message);
        toast("Cập nhật thất bại", "error")
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative p-8 shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10 rounded-full hover:bg-gray-100"
          onClick={() => navigate('/employer')}
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="mb-6 pt-2">
          <h1 className="text-2xl font-semibold">
            Tạo tin tuyển dụng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hoàn thành các bước để đăng tin tuyển dụng
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {steps.map((step, index) => {
            const active = index === currentStep
            const done = index < currentStep

            return (
              <div key={index} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium
                    ${active ? "bg-primary text-white"
                      : done ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"}
                    `}
                >
                  {done ? "✓" : index + 1}
                </div>

                <span className={`ml-2 text-sm ${active ? "font-semibold" : "text-muted-foreground"}`}>
                  {step}
                </span>

                {index !== steps.length - 1 &&
                  <div className="flex-1 h-[2px] bg-gray-200 mx-4" />
                }
              </div>
            )
          })}
        </div>
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-600 text-sm">
            {errorMessage}
          </div>
        )}
        <Card className="p-8 rounded-xl shadow-sm min-h-[450px]">

          {/* STEP 1 */}
          {currentStep === 0 && (
            <div className="space-y-6 max-w-xl">

              <div>
                <label className="text-sm font-medium">Lĩnh vực *</label>
                <select
                  className="w-full mt-1 rounded-xl border px-3 py-2 text-sm bg-white"
                  value={selectedSector}
                  onChange={(e) => {
                    setSelectedSector(e.target.value)
                    setForm({ ...form, occupationId: "" })
                  }}
                  disabled={loadingSector}
                >
                  <option value="">
                    {loadingSector ? "Đang tải..." : "Chọn lĩnh vực"}
                  </option>

                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Ngành nghề *</label>
                <select
                  className="w-full mt-1 rounded-xl border px-3 py-2 text-sm bg-white"
                  value={form.occupationId}
                  onChange={(e) =>
                    setForm({ ...form, occupationId: Number(e.target.value) })
                  }
                  disabled={!selectedSector || loadingOccupation}
                >
                  <option value="">
                    {!selectedSector
                      ? "Chọn lĩnh vực trước"
                      : loadingOccupation
                        ? "Đang tải..."
                        : "Chọn ngành nghề"}
                  </option>

                  {occupations.map((occupation) => (
                    <option key={occupation.id} value={occupation.id}>
                      {occupation.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Tiêu đề *</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Mô tả *</label>
                <textarea
                  className="w-full rounded-xl border px-4 py-3 text-sm"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Số lượng tuyển *</label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Giới tính yêu cầu</label>
                <select
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  value={form.genderRequirement}
                  onChange={(e) => setForm({ ...form, genderRequirement: e.target.value })}
                >
                  <option value="">Không yêu cầu</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tuổi tối thiểu</label>
                  <Input
                    type="number"
                    value={form.ageMin}
                    onChange={(e) =>
                      setForm({ ...form, ageMin: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Tuổi tối đa</label>
                  <Input
                    type="number"
                    value={form.ageMax}
                    onChange={(e) =>
                      setForm({ ...form, ageMax: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Lương tối thiểu (VND)</label>
                  <Input
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) =>
                      setForm({ ...form, salaryMin: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Lương tối đa (VND)</label>
                  <Input
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) =>
                      setForm({ ...form, salaryMax: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 1 && (
            <div className="space-y-6 max-w-xl">

              <div>
                <label className="text-sm font-medium">Ca làm *</label>
                <select
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  value={form.workingShift}
                  onChange={(e) => setForm({ ...form, workingShift: e.target.value })}
                >
                  <option value="">Chọn ca</option>
                  <option value="MORNING">Ca sáng</option>
                  <option value="AFTERNOON">Ca chiều</option>
                  <option value="NIGHT">Ca tối</option>
                  <option value="FULL_DAY">Toàn thời gian</option>
                  <option value="FLEXIBLE">Linh hoạt</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Địa chỉ</label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tỉnh/Thành phố *</label>
                <select
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  value={form.province}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      province: e.target.value,
                      district: ""
                    })
                  }
                  disabled={loadingProvince}
                >
                  <option value="">
                    {loadingProvince ? "Đang tải..." : "Chọn tỉnh/thành phố"}
                  </option>

                  {provinces.map((province) => (
                    <option key={province.code} value={province.name}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="text-sm font-medium">Quận/Huyện *</label>
                <select
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  value={form.district}
                  onChange={(e) =>
                    setForm({ ...form, district: e.target.value })
                  }
                  disabled={!form.province || loadingDistrict}
                >
                  <option value="">
                    {!form.province
                      ? "Chọn tỉnh trước"
                      : loadingDistrict
                        ? "Đang tải..."
                        : "Chọn quận/huyện"}
                  </option>

                  {districts.map((district) => (
                    <option key={district.code} value={district.name}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">

              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Câu hỏi ứng tuyển</h3>
                  <p className="text-sm text-muted-foreground">
                    Thêm các câu hỏi để thu thập thông tin từ ứng viên
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      fields: [
                        ...form.fields,
                        {
                          label: "",
                          fieldType: "text",
                          isRequired: false,
                          options: []
                        }
                      ]
                    })
                  }
                >
                  + Thêm câu hỏi
                </Button>
              </div>

              {/* List câu hỏi */}
              {form.fields.map((field, index) => (
                <Card
                  key={index}
                  className="p-6 rounded-2xl border shadow-sm space-y-6"
                >

                  {/* Dòng 1: Nội dung + Loại */}
                  <div className="grid grid-cols-3 gap-4 items-end">

                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium">
                        Nội dung câu hỏi
                      </label>
                      <Input
                        placeholder="Ví dụ: Bạn có bao nhiêu năm kinh nghiệm?"
                        value={field.label}
                        onChange={(e) => {
                          const updated = [...form.fields]
                          updated[index].label = e.target.value
                          setForm({ ...form, fields: updated })
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Loại câu trả lời
                      </label>
                      <select
                        className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
                        value={field.fieldType}
                        onChange={(e) => {
                          const updated = [...form.fields]
                          const newType = e.target.value

                          updated[index].fieldType = newType

                          if (newType === "select" || newType === "radio" || newType === "checkbox") {
                            if (!Array.isArray(updated[index].options)) {
                              updated[index].options = []
                            }
                          } else {
                            updated[index].options = []
                          }

                          setForm({ ...form, fields: updated })
                        }}
                      >
                        <option value="text">Trả lời ngắn</option>
                        <option value="textarea">Trả lời dài</option>
                        <option value="select">Danh sách chọn</option>
                        <option value="radio">Chọn một đáp án (Radio)</option>
                        <option value="checkbox">Chọn nhiều đáp án (Checkbox)</option>
                      </select>
                    </div>
                  </div>

                  {/* Options */}
                  {(field.fieldType === "select" ||
                    field.fieldType === "radio" ||
                    field.fieldType === "checkbox") && (
                      <div className="space-y-4">

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Danh sách lựa chọn
                          </span>

                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              const updated = [...form.fields]
                              updated[index].options.push("")
                              setForm({ ...form, fields: updated })
                            }}
                          >
                            + Thêm lựa chọn
                          </Button>
                        </div>

                        {(Array.isArray(field.options)
                          ? field.options
                          : []
                        ).map((opt, optIndex) => (
                          <div key={optIndex} className="flex gap-3 items-center">

                            <Input
                              placeholder={`Lựa chọn ${optIndex + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const updated = [...form.fields]
                                updated[index].options[optIndex] =
                                  e.target.value
                                setForm({ ...form, fields: updated })
                              }}
                            />

                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                const updated = [...form.fields]
                                updated[index].options.splice(optIndex, 1)
                                setForm({ ...form, fields: updated })
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-2 border-t">

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={field.isRequired}
                        onChange={(e) => {
                          const updated = [...form.fields]
                          updated[index].isRequired = e.target.checked
                          setForm({ ...form, fields: updated })
                        }}
                      />
                      Câu hỏi bắt buộc
                    </label>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updated = [...form.fields]
                        updated.splice(index, 1)
                        setForm({ ...form, fields: updated })
                      }}
                    >
                      Xóa câu hỏi
                    </Button>

                  </div>

                </Card>
              ))}

              {form.fields.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-10 border rounded-xl">
                  Chưa có câu hỏi nào. Hãy thêm câu hỏi để bắt đầu.
                </div>
              )}

            </div>
          )}

        </Card >

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
            Quay lại
          </Button>

          <Button
            onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
            disabled={isPending}
          >
            {currentStep === steps.length - 1
              ? isPending
                ? "Đang cập nhật..."
                : "Cập nhật tin"
              : "Tiếp tục"}
          </Button>
        </div>

      </div>
    </div>
  )
}
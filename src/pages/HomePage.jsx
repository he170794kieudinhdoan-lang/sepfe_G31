import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { MOCK_JOBS, getFeaturedJobs, getRegularJobs, HERO_IMAGE } from "@/shared/data/mockJobs";
import { Button2 } from "@/components/ui/button_2";

const POPULAR_KEYWORDS = [
  "công nhân sản xuất",
  "công nhân may mặc",
  "công nhân lắp ráp điện tử",
  "lao động phổ thông",
  "nhân viên kho",
  "phụ kho - bốc xếp",
];


function JobCard({ job, featured, aiSuggest }) {
  return (
    <Card className="p-0 shadow-sm hover:shadow-md transition rounded-xl overflow-hidden border-0">
      {!!job.imageUrl && (
        <ImageWithFallback
          src={job.imageUrl}
          alt=""
          className="w-full h-36 object-cover"
          fallbackClassName="h-36 w-full bg-gradient-to-br from-amber-100 to-amber-50"
        />
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>

          <div className="flex gap-1 flex-wrap justify-end">
            {featured && (
              <Badge className="bg-primary/20 text-primary rounded-lg border-0">Nổi bật</Badge>
            )}
            {aiSuggest && (
              <Badge className="bg-violet-100 text-violet-700 rounded-lg border-0">AI Suggest</Badge>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" /> {job.location}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">₫</span> {job.salary}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">⏱</span> {job.shift}
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-lg bg-amber-100/80 px-2 py-0.5 text-xs font-medium text-amber-800">
              {job.status || "Đang tuyển"}
            </span>
          </div>
        </div>

        {!!job.tags?.length && (
          <div className="mt-4 flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <span key={tag} className="text-xs rounded-full bg-gray-100 px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          <Button variant="outline" className="rounded-xl" asChild>
            <Link to={`/job/${job.id}`}>Xem chi tiết</Link>
          </Button>
          <span className="text-xs text-muted-foreground">{job.updated}</span>
        </div>
      </div>
    </Card>
  );
}

function SearchBarPopover({
  keyword,
  setKeyword,
  open,
  setOpen,
  searchMode,
  setSearchMode,
  featuredJobs,
}) {


  const nav = useNavigate();
  const handleSearch = () => {
    if (keyword.trim() === '') {
      return
    }
    nav(`/search?query=${encodeURIComponent(keyword.trim())}`)
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex-1 max-w-5xl flex items-center gap-2 rounded-xl bg-gray-100/80 shadow-sm px-3 py-2 relative m-auto my-5">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />

        <PopoverTrigger asChild>
          <div className="flex-1 min-w-0 ">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              // onFocus={() => setOpen(true)}
              // onClick={() => setOpen(true)}
              placeholder="Tìm theo tên việc/công ty/khu vực"
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-9 flex-1 min-w-0"
            />
          </div>
        </PopoverTrigger>

        <Button2 size="sm" className="rounded-lg shrink-0 border" onClick={() => { setOpen(false); handleSearch() }}>
          Tìm kiếm
        </Button2>
      </div>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={10}
        className="w-[980px] max-h-[650px] p-0 rounded-2xl shadow-xl border bg-white"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="px-5 py-4">
          <div className="flex items-center gap-4">
            {/* <div className="text-sm font-semibold">Tìm kiếm theo:</div> */}

            <RadioGroup value={searchMode} onValueChange={setSearchMode} className="flex gap-6">
              {/* <div className="flex items-center gap-2">
                <RadioGroupItem value="job" id="sm-job" />
                <Label htmlFor="sm-job">Tên việc làm</Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem value="company" id="sm-company" />
                <Label htmlFor="sm-company">Tên công ty</Label>
              </div> */}
              {/* 
              <div className="flex items-center gap-2">
                <RadioGroupItem value="both" id="sm-both" />
                <Label htmlFor="sm-both">Cả hai</Label>
              </div> */}
            </RadioGroup>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-[1fr_auto_1fr]">
          {/* LEFT */}
          <div className="p-5">
            <div className="font-semibold mb-3">Từ khóa phổ biến</div>

            <ScrollArea className="h-auto pr-3">
              <div className="space-y-1">
                {POPULAR_KEYWORDS.map((k) => (
                  <button
                    key={k}
                    className="w-full text-left rounded-xl px-3 py-2 hover:bg-muted text-sm"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setKeyword(k);
                      setOpen(false);
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator orientation="vertical" />

          {/* RIGHT */}
          <div className="p-5">
            <div className="font-semibold mb-3">Việc làm có thể bạn quan tâm</div>

            <ScrollArea className="h-[340px] pr-3">
              <div className="space-y-2">
                {featuredJobs.slice(0, 6).map((job) => (
                  <Link
                    key={job.id}
                    to={`/job/${job.id}`}
                    className="block rounded-2xl p-3 hover:bg-muted"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setOpen(false)}
                  >
                    <div className="font-medium line-clamp-1">{job.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {job.company} • {job.salary ?? "Thỏa thuận"}
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function HomePage() {
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [openSuggest, setOpenSuggest] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [searchMode, setSearchMode] = useState("both"); // job | company | both

  // demo flags
  const isWorker = true;
  const isProfileComplete = false;

  const featuredJobs = useMemo(() => getFeaturedJobs(), []);
  const regularJobs = useMemo(() => {
    const list = getRegularJobs();
    if (sort !== "salary") return list;
    return [...list].sort((a, b) => (b.salary > a.salary ? 1 : -1));
  }, [sort]);

  const recommendedJobs = useMemo(() => {
    if (!isProfileComplete) return [];
    return MOCK_JOBS.filter((j) => j.id !== 1).slice(0, 2);
  }, [isProfileComplete]);

  const perPage = 4;
  const totalPages = Math.max(1, Math.ceil(regularJobs.length / perPage));
  const paginatedJobs = regularJobs.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="bg-gray-50 min-h-full">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[url('/banner.jpg')]">
        <div className="absolute inset-0 bg-black/20" />
        <SearchBarPopover
          keyword={keyword}
          setKeyword={setKeyword}
          open={openSuggest}
          setOpen={setOpenSuggest}
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          featuredJobs={featuredJobs}
        />

        <div className="container mx-auto px-16 py-16 grid lg:grid-cols-2 gap-10 items-center relative">
          <div className="space-y-5">
            <Badge className="bg-white text-black border-primary/30 w-fit rounded-lg">
              Ứng tuyển nhanh trong 1 phút
            </Badge>

            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-white">
              Tìm việc nhanh – thông tin rõ ràng
            </h1>

            <p className="text-lg text-white/90">Lương, ca làm, phụ cấp, địa điểm.</p>

            <Button2 className="rounded-xl px-6" asChild>
              <Link to="#jobs">Xem việc làm</Link>
            </Button2>
          </div>

          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-md aspect-video bg-gray-100">
              <ImageWithFallback
                src={HERO_IMAGE}
                alt="Tìm việc làm - WorkLink"
                className="w-full h-full object-cover"
                fallbackClassName="w-full h-full bg-gradient-to-br from-amber-100 to-amber-50"
              />
            </div>
          </div >
        </div >
      </section >

      {/* FEATURED */}
      < section id="jobs" className="container mx-auto px-6 py-12 space-y-6 max-w-7xl" >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Job nổi bật</h2>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {featuredJobs.map((job) => (
            <JobCard key={job.id} job={job} featured />
          ))}
        </div>
      </section >

      {/* REGULAR */}
      < section className="container mx-auto px-6 pb-16 space-y-6 max-w-7xl" >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-2xl font-bold">Danh sách job thường</h2>

          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl px-4 py-2 text-sm bg-white shadow-sm"
            >
              <option value="newest">Mới nhất</option>
              <option value="salary">Lương cao</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {paginatedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={page === p ? "default" : "outline"}
              className="rounded-xl h-9 w-9 p-0"
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
        </div>

        {/* AI recommend block */}
        {
          isWorker && (
            <Card className="p-6 rounded-xl border-0 shadow-sm bg-white/90">
              {isProfileComplete ? (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">Gợi ý phù hợp cho bạn (AI)</h3>
                      <p className="text-sm text-muted-foreground">Dựa trên hồ sơ và khu vực bạn quan tâm.</p>
                    </div>
                    <Button variant="outline" className="rounded-xl">
                      Lọc thêm
                    </Button>
                  </div>
                  <div className="mt-6 grid md:grid-cols-2 gap-4">
                    {recommendedJobs.map((job) => (
                      <JobCard key={job.id} job={job} aiSuggest />
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Hoàn thiện hồ sơ để nhận gợi ý</h3>
                    <p className="text-sm text-muted-foreground">
                      Cập nhật kỹ năng và kinh nghiệm để AI gợi ý chính xác hơn.
                    </p>
                  </div>
                  <Button className="rounded-xl" asChild>
                    <Link to="/profile">Cập nhật hồ sơ</Link>
                  </Button>
                </div>
              )}
            </Card>
          )
        }
      </section >
    </div >
  );
}

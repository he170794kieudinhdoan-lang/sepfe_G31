const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const filesToFix = ['src/features/admin/api/useAdmin.js', 'src/features/jobs/api/useJobs.js', 'src/features/jobs/useJobMutation.js', 'src/features/users/api/useUser.js', 'src/features/wallet/api/useWallet.js', 'src/features/companies/api/useGetCompanies.js'];

filesToFix.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace any staleTime override with staleTime: 0
  content = content.replace(/staleTime:\s*[^,]+,/g, 'staleTime: 0,');
  content = content.replace(/refetchOnWindowFocus:\s*false,/g, 'refetchOnWindowFocus: true,');

  // Inject staleTime: 0 where missing
  const queryBlocks = content.split('useQuery({');
  for (let i = 1; i < queryBlocks.length; i++) {
     let block = queryBlocks[i];
     if (!/staleTime\s*:\s*[0-9]+/.test(block.substring(0, 300))) {
        // Insert staleTime: 0 after queryFn:
        if (/(queryFn\s*:\s*.*?,)/.test(block)) {
           block = block.replace(/(queryFn\s*:\s*.*?,)/, '$1\n    staleTime: 0,');
        } else if (/(queryKey\s*:\s*.*?,)/.test(block)) {
           // If queryFn was not matched, try queryKey
           block = block.replace(/(queryKey\s*:\s*.*?,)/, '$1\n    staleTime: 0,');
        }
        queryBlocks[i] = block;
     }
  }
  content = queryBlocks.join('useQuery({');
  
  fs.writeFileSync(file, content, 'utf8');
});

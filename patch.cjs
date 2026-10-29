const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.jsx', 'utf8');

// 1. Add import
if(!content.includes('import ManageAds from')) {
  content = content.replace(/import ManageAchievements from '[^']+';/, 
    "import ManageAchievements from '../components/Admin/ManageAchievements';\nimport ManageAds from '../components/Admin/ManageAds';");
}

// 2. Add desktop sidebar tab
const desktopTab = `          <button onClick={() => setActiveTab('ads')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm \${activeTab === 'ads' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}\`}>
            <FiFileText className={\`w-5 h-5 \${activeTab === 'ads' ? 'text-red-600' : 'text-gray-400'}\`} /> Manage Ads
          </button>\n`;
if (!content.includes("setActiveTab('ads')")) {
  content = content.replace(/<\/nav>\s*<div className="p-4 border-t border-gray-100 bg-gray-50\/50">/g, match => 
    desktopTab + match
  );
}

// 3. Add mobile sidebar tab
const mobileTab = `                <button onClick={() => {setActiveTab('ads'); setIsMobileMenuOpen(false);}} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm \${activeTab === 'ads' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'}\`}>
                  <FiFileText className="w-5 h-5" /> Manage Ads
                </button>\n`;
if (!content.includes("setActiveTab('ads'); setIsMobileMenuOpen(false);")) {
  content = content.replace(/<\/nav>\s*<div className="p-4 border-t border-gray-100">/g, match => 
    mobileTab + match
  );
}

// 4. Add component rendering
const renderCode = `\n        {activeTab === 'ads' && (
          <div className="mb-10">
            <ManageAds />
          </div>
        )}\n`;
if(!content.includes('<ManageAds />')) {
  content = content.replace(/<div className="max-w-6xl mx-auto pb-10">/, match => match + renderCode);
}

fs.writeFileSync('src/pages/Admin.jsx', content);
console.log("Admin.jsx patched successfully!");

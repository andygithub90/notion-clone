# 注意事項
1. 執行 `npx shadcn-ui@latest init` init shadcn 的時候會出現 ? Where is your tailwind.config.js located? › tailwind.config.js ，這裡給我們的預設值是 tailwind.config.js ，但是我們在執行 `npx create-next-app@latest` 創建 next 專案的時候， create-next-app 給我們的是 tailwind.config.ts ，是 ts 文件不是 js 文件，所以我們這邊應該輸入 tailwind.config.ts 後回車

# VScode extensions
1. Trunk Check    
   安裝 Trunk Check 
   - No committed files in repo, unable to analyze files. `trunk init` enables linters automatically based on the contents of your repo, so you must have something in your repo for it to work.
# Ntion clone

## 注意事項

1. 執行 `npx shadcn-ui@latest init` init shadcn 的時候會出現 ? Where is your tailwind.config.js located? › tailwind.config.js ，這裡給我們的預設值是 tailwind.config.js ，但是我們在執行 `npx create-next-app@latest` 創建 next 專案的時候， create-next-app 給我們的是 tailwind.config.ts ，是 ts 文件不是 js 文件，所以我們這邊應該輸入 tailwind.config.ts 後回車

## VScode extensions

1. Trunk Check：到 VScode 的 Side Panel 的 extensions tab 安裝 Trunk Check
   - Features: Trunk manages all configuration as code in your repo's .trunk/trunk.yaml file. When you first start trunk, it scans your repo for which linters and formatters apply to the files you have and sets up an initial .trunk/trunk.yaml file for you to use. See the [docs](https://docs.trunk.io/) for more details. Trunk Check 會掃描你 repo 的所有檔案然後安裝所有你需要的 linters ，這些 linters 會列在 .trunk/trunk.yaml
   - 錯誤處理：如果看到 No committed files in repo, unable to analyze files. `trunk init` enables linters automatically based on the contents of your repo, so you must have something in your repo for it to work. 這行錯誤表示你的 repo 還沒有 commit 所以 Trunk Check
   - Trunk Side Panel：
     1. 專案如果還沒有安裝 Trunk 可以到 VScode 的 Side Panel 找到 Trunk Side Panel 並點擊 install
     2. 找到 Trunk Side Panel 在 existing issues 可以看到 Trunk 檢查出你的 code 有什麼問題
   - trunk login: 在終端機 run `trunk login` login to trunk 使用一些更進階的功能
   - 使用指令 format 文件 ：按下 cmd + shift + p ，輸入 format document with 回車，選擇 Trunk Check ， Trunk Check 就會幫你 format 好文件

## next.js routing

### Private Folders

https://nextjs.org/docs/app/building-your-application/routing/colocation#private-folders<br/>
如果你有想要在 app dir 底下創建一個目錄但是又不想他被存取可以在目錄名前面加一個底線，這樣這個目錄就沒辦法從 url 直接訪問他，如果我創建了 app/components/page.tsx 那假如我的服務起在 3000 port ，那我就可以通過 http://localhost:3000/components 存取這頁，但如果我在目錄名家一個底線 app/\_components/page.tsx 我就沒辦法通過 http://localhost:3000/components 存取這頁

### Route Groups

https://nextjs.org/docs/app/building-your-application/routing/route-groups<br/>
Even though routes inside (marketing) and (shop) share the same URL hierarchy, you can create a different layout for each group by adding a layout.js file inside their folders.<br/>
如果你想把某些目錄放在 a 目錄下，但是又不想在 url path 上看到 a 這個路徑就可以使用 Route Groups ，範例： `(a)/page.tsx` ，這樣 a 就不會影嚮到 url 的路徑<br/>
you can create a different layout for each group by adding a layout.js file inside their folders.<br/>
Route Groups 的另一個作用是可以給不同 Route Group 他自己的 layout<br/>
像是：<br/>
`(a)/layout.tsx`<br/>
`(a)/page.tsx`<br/>
`(b)/b/layout.tsx`<br/>
`(b)/b/page.tsx`<br/>
但如果是像下面就不行，因為根路徑會衝突，存取`/`時會不知道是去(a)下還是(b)下：<br/>
`(a)/layout.tsx`<br/>
`(a)/page.tsx`<br/>
`(b)/layout.tsx`<br/>
`(b)/page.tsx`<br/>

## backend and authentication

### using Convex as our backend and as our realtime database

https://www.convex.dev/<br/>

### get started

1. goto https://www.convex.dev/
2. click Login
3. click Login in with Github
4. click Authorize get-convex
5. check Terms of Service and click Continue, and the it will redirect you to the dashboard
6. goto https://www.convex.dev/
7. 到導覽列點 Developers -> 點 Documentation -> Next.js
8. `npm install convex`
9. `npx convex dev`
10. ```sh
    MAC notion-clone % npx convex dev
    Welcome to developing with Convex, let's get you logged in.
    ? Device name: ST*****MAC
    Visit https://auth.convex.dev/activate?user_code=GXZV-RDXL to finish logging in.
    You should see the following code which expires in 15 minutes: GXZV-RDXL
    ? Open the browser? Yes
    ✔ Saved credentials to ~/.convex/config.json
    ? What would you like to configure? a new project
    ? Project name: notion-clone
    ✔ Created project notion-clone-f0a54, manage it at https://dashboard.convex.dev
    ✔ Provisioned a dev deployment and saved its:
        name as CONVEX_DEPLOYMENT to .env.local
        URL as NEXT_PUBLIC_CONVEX_URL to .env.local

    Write your Convex functions in convex/
    Give us feedback at https://convex.dev/community or support@convex.dev

    ✔ 19:32:41 Convex functions ready! (1.55s)
    ```

#### Convex Clerk

https://docs.convex.dev/auth/clerk<br/>

1. Sign up for Clerk: 要先到 https://clerk.com/ and login
2. click Add application
3. 這裡我們先選擇 GitHub ，點擊 Create application 後， redirect 到 dashboard 頁面
4. 在 dashboard 頁面複製 API Keys 貼到 .env.local file
5. Create a JWT Template: 到 clerk.com 的 dashboard 的左側欄點擊 JWT Templates -> 點擊 New template -> 點擊 Convex -> 找到 Issuer URL 複製起來 -> 創建 convex/auth.config.js -> 貼上下面的內容
   `js
export default {
  providers: [
    {
      domain: "https://your-issuer-url.clerk.accounts.dev/",
      applicationID: "convex",
    },
  ]
};
`
   -> 把 domain 的值換成 clerk 的 Issuer URL
6. Deploy your changes: 再 run 一次 `npx convex dev` 看看有沒有報錯
7. 回到 clerk 的 dashboard 點擊 Apply changes
8. Install clerk: run `npm install @clerk/clerk-react`
9. create file `components/providers/convex-provider.tsx` ，用來提供 convex 和 clerk auth ， 並在 app/layout.tsx 引入，提供 convex 和 clerk auth 給整個 app ，可以參考 app/layout.tsx
10. run `npm run dev` check if there are any errors
11. 開始使用 Convex Clerk 提供的功能
    1. Use the useConvexAuth() hook to check whether the user is logged in or not. https://docs.convex.dev/auth/clerk#logged-in-and-logged-out-views
    2. you can use the SignInButton component to create a login flow for your app. https://docs.convex.dev/auth/clerk#login-and-logout-flows

#### define schema

1. 確認 `npx convex dev` 和 `npm run dev` 這兩個指令正在不同的終端機運行
2. 創建 convex/schema.ts 文件
3. 在 convex/schema.ts 文件定義我們的 schema , code 可以參考 convex/schema.ts
4. 定義完 schema 後在 convex 的 dashboard -> 點擊我們專案 -> 點擊 Data -> 點擊我們定義的 table -> 點擊 Show Schema ，可以看到我們剛才在 convex/schema.ts 寫的 schema

#### create API functions

1. create file convex/documents.ts
2. code 請參考 convex/documents.ts
3. 在 convex/documents.ts 寫完 API functions 之後在 convex 的 dashboard -> Functions -> documents:create 可以看到我們剛剛寫好的 code 和這個 API functions 的相關資訊
4. 調用 API functions
   ```ts
   import { useMutation } from "convex/react";
   import { api } from "@/convex/_generated/api";
   const create = useMutation(api.documents.create); // 因為我們在 convex/documents.ts 這個文件 export create function 所以這邊會是 api.documents.create)
   ```

#### Reading Data - db.get method VS db.query method

About Reading Data: https://docs.convex.dev/database/reading-data#querying-documents

1. db.get method: https://docs.convex.dev/api/interfaces/server.DatabaseReader#get
2. db.query method: https://docs.convex.dev/api/interfaces/server.DatabaseReader#query

get&lt;TableName&gt;(id) 方法是用於從資料庫中獲取單個文檔的方法。它需要提供文檔的通用識別符（id），然後返回這個特定文檔的信息，或者如果文檔不存在則返回 null。

query&lt;TableName&gt;(tableName) 方法是用於發起一個查詢操作，而不是直接返回單個文檔。它需要提供要查詢的表名，然後返回一個用於構建查詢的初始化器對象。這個方法通常用於建立複雜的查詢，以檢索符合特定條件的文檔集合。

簡而言之，get 方法用於直接從資料庫中獲取單個文檔，而 query 方法則用於發起查詢操作以檢索文檔集合。

## Upload file

### Use Edgestore to upload files

#### Setup

1. goto https://edgestore.dev/
2. sign in
3. click new project
4. name your Project Name
5. copy keys to .env file
6. click Continue in the docs, or goto https://edgestore.dev/docs/quick-start
7. install packages, run `npm install @edgestore/server @edgestore/react zod`
8. setup backend see: https://edgestore.dev/docs/quick-start#backend or `app/api/edgestore/[...edgestore]/route.ts`
9. 8. setup frontend see: https://edgestore.dev/docs/quick-start#frontend or `lib/edgestore.ts`

#### Use image component to upload images

1. Installation, see: https://edgestore.dev/docs/components/image#installation or run `npm install tailwind-merge react-dropzone lucide-react`
2. create upload image component, see `components/single-image-dropzone.tsx` and `components/modals/cover-image-modal.tsx`

#### Delete file from edgestore

1. goto https://edgestore.dev/docs/quick-start#delete-file , 他說 you will need to set the beforeDelete lifecycle hook on the bucket.
2. goto https://edgestore.dev/docs/configuration#lifecycle-hooks ，想直接從客戶端刪除檔案需要改 Configuration , see `app/api/edgestore/[...edgestore]/route.ts` ，
   ```ts
   const edgeStoreRouter = es.router({
     publicFiles: es
       .fileBucket()
       /**
        * https://edgestore.dev/docs/configuration#lifecycle-hooks
        * return `true` to allow delete
        * This function must be defined if you want to delete files directly from the client.
        */
       .beforeDelete(() => {
         return true; // allow delete
       }),
   });
   ```
3. 回到 https://edgestore.dev/docs/quick-start#delete-file ，參考代碼：`components/cover.tsx`

#### Replace file from edgestore

1. see https://edgestore.dev/docs/quick-start#replace-file and `hooks/use-cover-image.tsx`

## block-based rich-text editor: BlockNote

https://www.blocknotejs.org/

### Import as dynamic

https://www.blocknotejs.org/docs/advanced/nextjs#import-as-dynamic

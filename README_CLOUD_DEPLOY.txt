BCCIT ACADEMY - Cloud deployment files

Files to upload to the ROOT of your GitHub repository:
1) BCCIT_People_of_the_Future_AI_Team.html
2) server.js
3) render.yaml
4) README_CLOUD_DEPLOY.txt (optional documentation)

Deploy with Render:
1. Create a new Web Service and connect the GitHub repository.
2. Runtime: Node. Build command: leave blank. Start command: node server.js.
3. Add environment variable OPENAI_API_KEY with your own OpenAI API key. Do not put the key in GitHub or in the HTML file.
4. Optionally set OPENAI_MODEL to gpt-4.1-mini.
5. Deploy. Open the Render service URL to load the catalog.

The HTML page calls POST /api/team-chat on the same host. The server calls the OpenAI Responses API and returns {"reply":"..."}.

Security note: never share your API key in chat or commit it to GitHub. API usage may incur separate charges. Test /health after deployment; expected JSON is {"ok":true,"service":"BCCIT AI Team"}.

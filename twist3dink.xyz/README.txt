==============================
twist3dink.xyz — Clean URL GitHub Pages Setup
==============================

STRUCTURE:
  /index.html ................ root homepage
  /devil/ ..................... subproject
  /echo/ ...................... subproject
  /sayless/ ................... subproject
  /academy/ ................... subsite for academy content

EACH folder contains its own index.html, which hides .html extensions.

DEPLOYMENT:
1. Push this entire folder to your GitHub repo (main branch).
2. In GitHub → Settings → Pages → Source: select 'Deploy from branch: main / (root)'.
3. Your custom domain (CNAME) is already configured.
4. Namecheap DNS:
   A Record @ → 185.199.108.153
   A Record @ → 185.199.109.153
   A Record @ → 185.199.110.153
   A Record @ → 185.199.111.153
   CNAME Record www → twist3dink.github.io
5. GitHub Pages will auto-deploy and HTTPS will activate.

You now have clean URLs:
  twist3dink.xyz/devil
  twist3dink.xyz/echo
  twist3dink.xyz/sayless
  twist3dink.xyz/academy

To add more pages:
  mkdir newpage && echo "<html>Your content</html>" > newpage/index.html

No .html will appear in URLs.

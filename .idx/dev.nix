{pkgs}: {
  channel = "stable-24.05";

  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.firebase-tools
  ];

  idx = {
    extensions = [
      "bradlc.vscode-tailwindcss"
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
    ];

    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };

    workspace = {
      onCreate = {
        default.openFiles = ["src/app/page.tsx"];
        npm-install = "npm install";
      };
      onStart = {

      };
    };
  };
}

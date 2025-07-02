#!/bin/bash

echo "Setting up NestJS Project Builder..."
echo "===================================="

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

OS="unknown"
case "$(uname -s)" in
    Darwin*)    OS="macOS";;
    Linux*)     OS="Linux";;
    CYGWIN*|MINGW*|MSYS*) OS="Windows";;
esac

echo -e "${BLUE}Detected OS: $OS${NC}"

check_command() {
  if command -v "$1" >/dev/null 2>&1; then
    echo -e "${GREEN}$1 is installed${NC}"
    return 0
  else
    echo -e "${RED}$1 is not installed${NC}"
    return 1
  fi
}

check_node_version() {
  if command -v node >/dev/null 2>&1; then
    local node_version=$(node -v | sed 's/v//')
    local major_version=$(echo $node_version | cut -d. -f1)

    echo -e "${BLUE}Node.js version: v$node_version${NC}"

    if [ "$major_version" -ge 18 ]; then
      echo -e "${GREEN}Node.js version is compatible${NC}"
      return 0
    else
      echo -e "${RED}Node.js version $node_version is not supported. Please upgrade to v18+${NC}"
      return 1
    fi
  else
    echo -e "${RED}Node.js is not installed${NC}"
    return 1
  fi
}

check_vscode_windows() {
  if [ "$OS" = "Windows" ]; then
    if tasklist //FI "IMAGENAME eq Code.exe" 2>/dev/null | grep -q "Code.exe"; then
      echo -e "${YELLOW}VSCode is running. This may cause permission issues on Windows.${NC}"
      echo -e "${BLUE}Recommendation: Close VSCode, or press Enter to continue...${NC}"
      read -r
    fi
  fi
}

kill_node_processes() {
  echo -e "${BLUE}Stopping Node.js processes...${NC}"

  case $OS in
    "Windows")
      taskkill //F //IM node.exe 2>/dev/null || true
      taskkill //F //IM npm.cmd 2>/dev/null || true
      sleep 3
      ;;
    "macOS"|"Linux")
      pkill -f "node.*nest" 2>/dev/null || true
      pkill -f "npm.*start" 2>/dev/null || true
      sleep 1
      ;;
  esac
}

force_remove_directory() {
  local dir="$1"
  if [ -d "$dir" ]; then
    echo -e "${YELLOW}Removing: $dir${NC}"

    case $OS in
      "Windows")
        local attempts=0
        local max_attempts=3

        while [ $attempts -lt $max_attempts ]; do
          rm -rf "$dir" 2>/dev/null && break

          if [ -d "$dir" ]; then
            echo -e "${YELLOW}Attempt $((attempts + 1))/$max_attempts...${NC}"
            sleep 2
            attempts=$((attempts + 1))
          else
            break
          fi
        done

        if [ -d "$dir" ] && command -v powershell >/dev/null 2>&1; then
          echo -e "${BLUE}Using PowerShell for removal...${NC}"
          powershell -Command "Remove-Item -Path '$dir' -Recurse -Force -ErrorAction SilentlyContinue" 2>/dev/null || true
          sleep 1
        fi
        ;;
      "macOS"|"Linux")
        rm -rf "$dir" 2>/dev/null || true
        ;;
    esac

    if [ -d "$dir" ]; then
      echo -e "${YELLOW}Could not fully remove $dir (files may be in use)${NC}"
    else
      echo -e "${GREEN}Removed: $dir${NC}"
    fi
  fi
}

install_npm_deps() {
  local location="$1"
  local name="$2"
  local max_attempts=3
  local attempt=1

  while [ $attempt -le $max_attempts ]; do
    echo -e "${BLUE}Installing $name dependencies (attempt $attempt/$max_attempts)...${NC}"

    local install_cmd="npm install"

case $OS in
  "Windows")
    install_cmd="$install_cmd --prefer-offline"
    ;;
  "macOS"|"Linux")
    install_cmd="$install_cmd"
    ;;
esac

    if eval $install_cmd; then
      echo -e "${GREEN}$name dependencies installed successfully${NC}"
      return 0
    else
      echo -e "${YELLOW}Attempt $attempt failed${NC}"

      if [ $attempt -eq $max_attempts ]; then
        echo -e "${RED}Failed to install $name dependencies after $max_attempts attempts${NC}"
        return 1
      fi

      npm cache clean --force 2>/dev/null || true
      sleep 2
      attempt=$((attempt + 1))
    fi
  done
}

echo -e "${BLUE}Checking prerequisites...${NC}"
all_good=true

if ! check_command "node"; then all_good=false; fi
if ! check_command "npm"; then all_good=false; fi
if ! check_command "git"; then all_good=false; fi

if ! check_node_version; then all_good=false; fi

if [ "$all_good" = false ]; then
  echo ""
  echo -e "${RED}Prerequisites not met. Please install missing tools.${NC}"

  case $OS in
    "macOS")
      echo -e "${YELLOW}Install via Homebrew: brew install node git${NC}"
      ;;
    "Linux")
      echo -e "${YELLOW}Install via package manager: sudo apt install nodejs npm git${NC}"
      ;;
    "Windows")
      echo -e "${YELLOW}Install from: https://nodejs.org and https://git-scm.com${NC}"
      ;;
  esac

  exit 1
fi

check_vscode_windows

kill_node_processes

echo ""
echo -e "${BLUE}Cleaning old files...${NC}"

force_remove_directory "node_modules"
force_remove_directory "client/node_modules"
force_remove_directory "server/node_modules"

rm -f package-lock.json client/package-lock.json server/package-lock.json 2>/dev/null || true
rm -rf client/.next server/dist 2>/dev/null || true

echo -e "${BLUE}Clearing npm cache...${NC}"
npm cache clean --force 2>/dev/null || true

echo -e "${BLUE}Configuring npm...${NC}"
npm config set fund false
npm config set audit false

case $OS in
  "Windows")
    npm config set maxsockets 1
    npm config set prefer-offline true
    ;;
  "macOS")
    npm config set maxsockets 5
    ;;
  "Linux")
    npm config set maxsockets 10
    ;;
esac

echo ""
if install_npm_deps "." "root"; then
  echo -e "${GREEN}Root dependencies installed${NC}"
else
  echo -e "${RED}Failed to install root dependencies${NC}"
  exit 1
fi

echo ""
cd client
if install_npm_deps "./client" "client"; then
  echo -e "${GREEN}Client dependencies installed${NC}"
else
  echo -e "${RED}Failed to install client dependencies${NC}"
  cd ..
  exit 1
fi
cd ..

echo ""
cd server
if install_npm_deps "./server" "server"; then
  echo -e "${GREEN}Server dependencies installed${NC}"
else
  echo -e "${RED}Failed to install server dependencies${NC}"
  cd ..
  exit 1
fi
cd ..

echo ""
echo -e "${BLUE}Setting up git hooks...${NC}"
if [ -d ".git" ]; then
  if npm run prepare 2>/dev/null; then
    echo -e "${GREEN}Git hooks installed${NC}"

    if [ "$OS" = "macOS" ] || [ "$OS" = "Linux" ]; then
      chmod +x .husky/* 2>/dev/null || true
    fi
  else
    echo -e "${YELLOW}Git hooks setup failed (continuing...)${NC}"
  fi
else
  echo -e "${YELLOW}Not a git repository, skipping hooks setup${NC}"
fi

echo ""
echo -e "${BLUE}Creating necessary directories...${NC}"
mkdir -p server/temp
mkdir -p shared
echo -e "${GREEN}Directories created${NC}"

echo ""
echo -e "${BLUE}Resetting npm config...${NC}"
npm config delete fund 2>/dev/null || true
npm config delete audit 2>/dev/null || true
npm config delete maxsockets 2>/dev/null || true
npm config delete prefer-offline 2>/dev/null || true

echo ""
echo -e "${BLUE}Validating setup...${NC}"

validation_failed=false

if npm list react >/dev/null 2>&1 && npm list @nestjs/core >/dev/null 2>&1; then
  echo -e "${GREEN}Core packages are installed${NC}"
else
  echo -e "${YELLOW}Some core packages may be missing${NC}"
  validation_failed=true
fi

if npm run type-check:incremental >/dev/null 2>&1; then
  echo -e "${GREEN}TypeScript compilation works${NC}"
else
  echo -e "${YELLOW}TypeScript compilation has issues${NC}"
  validation_failed=true
fi

if npm run lint >/dev/null 2>&1; then
  echo -e "${GREEN}ESLint is working${NC}"
else
  echo -e "${YELLOW}ESLint has issues (run 'npm run lint:fix' to auto-fix)${NC}"
  validation_failed=true
fi

echo ""
if [ "$validation_failed" = true ]; then
  echo -e "${YELLOW}Setup completed with some issues${NC}"
  echo -e "${BLUE}Run the following to fix common issues:${NC}"
  echo "   npm run lint:fix"
  echo "   npm run type-check"
else
  echo -e "${GREEN}Setup completed successfully on $OS${NC}"
fi

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Make script executable: chmod +x setup.sh"
echo "2. Fix any remaining issues: npm run lint:fix"
echo "3. Start development: npm run dev"
echo "4. Run health check: npm run check"

case $OS in
  "Windows")
    echo ""
    echo -e "${BLUE}Windows tips:${NC}"
    echo "• Use Git Bash or WSL for best experience"
    echo "• If permission errors persist, run as administrator"
    echo "• Close VSCode if you encounter file lock issues"
    ;;
  "macOS")
    echo ""
    echo -e "${BLUE}macOS tips:${NC}"
    echo "• React peer dependency warnings are usually safe to ignore"
    echo "• Use Terminal or iTerm2 for best experience"
    ;;
  "Linux")
    echo ""
    echo -e "${BLUE}Linux tips:${NC}"
    echo "• Make sure you have build-essential installed for native modules"
    ;;
esac

echo ""
echo -e "${GREEN}Setup complete. Happy coding!${NC}"
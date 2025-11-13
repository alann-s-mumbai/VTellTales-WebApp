#!/bin/bash

# VTellTales Database Setup Script v1.1.0
# This script creates a local SQLite database for development

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DB_PATH="$PROJECT_ROOT/backend/VTellTalesCore/VTellTales_WA.API/VTellTales_WA.API/vtelltales_local.db"

echo "🗄️  VTellTales Database Setup v1.1.0"
echo "====================================="

# Check if SQLite is available
if ! command -v sqlite3 &> /dev/null; then
    echo "⚠️  SQLite not found. Installing via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install sqlite
    else
        echo "❌ Please install SQLite manually"
        exit 1
    fi
fi

echo "📊 Creating local development database..."

# Create the database with basic structure
sqlite3 "$DB_PATH" << 'EOF'
-- VTellTales Local Database Schema

-- User profiles table
CREATE TABLE IF NOT EXISTS ProfileData (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId TEXT NOT NULL UNIQUE,
    FirstName TEXT NOT NULL,
    LastName TEXT NOT NULL,
    Email TEXT,
    ProfileImageUrl TEXT,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Story types table
CREATE TABLE IF NOT EXISTS StoryType (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    TypeName TEXT NOT NULL UNIQUE,
    Description TEXT,
    IsActive INTEGER DEFAULT 1,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stories table
CREATE TABLE IF NOT EXISTS StoryData (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    StoryId TEXT NOT NULL UNIQUE,
    UserId TEXT NOT NULL,
    Title TEXT NOT NULL,
    Description TEXT,
    StoryTypeId INTEGER,
    ImageUrl TEXT,
    IsPublished INTEGER DEFAULT 0,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (StoryTypeId) REFERENCES StoryType(Id),
    FOREIGN KEY (UserId) REFERENCES ProfileData(UserId)
);

-- Story pages table
CREATE TABLE IF NOT EXISTS StoryPages (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    StoryId TEXT NOT NULL,
    PageNumber INTEGER NOT NULL,
    Content TEXT,
    ImageUrl TEXT,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (StoryId) REFERENCES StoryData(StoryId)
);

-- Insert default story types
INSERT OR IGNORE INTO StoryType (TypeName, Description) VALUES 
('Adventure', 'Exciting stories full of action and exploration'),
('Fantasy', 'Magical stories with mythical creatures and worlds'),
('Mystery', 'Suspenseful stories with puzzles to solve'),
('Romance', 'Love stories and romantic adventures'),
('Science Fiction', 'Futuristic stories with advanced technology'),
('Horror', 'Scary stories designed to frighten and thrill'),
('Comedy', 'Funny stories meant to entertain and amuse'),
('Drama', 'Serious stories with emotional depth');

-- Insert demo user profile
INSERT OR IGNORE INTO ProfileData (UserId, FirstName, LastName, Email) VALUES 
('demo-user-123', 'John', 'Doe', 'demo@vtelltales.com');

-- Insert demo stories
INSERT OR IGNORE INTO StoryData (StoryId, UserId, Title, Description, StoryTypeId, IsPublished) VALUES 
('story-1', 'demo-user-123', 'The Magical Forest Adventure', 'A young explorer discovers a hidden magical forest filled with talking animals and ancient secrets.', 2, 1),
('story-2', 'demo-user-123', 'Mystery of the Lost Treasure', 'Detective Sarah investigates the disappearance of a priceless artifact from the local museum.', 3, 1),
('story-3', 'demo-user-123', 'Space Station Alpha', 'Commander Johnson must save his crew when their space station encounters an alien threat.', 5, 1);

-- Insert demo story pages
INSERT OR IGNORE INTO StoryPages (StoryId, PageNumber, Content) VALUES 
('story-1', 1, 'Emma had always been curious about the woods behind her grandmother''s house. Today, she finally decided to explore them.'),
('story-1', 2, 'As she walked deeper into the forest, she noticed the trees seemed to shimmer with an otherworldly light.'),
('story-1', 3, 'Suddenly, a small rabbit wearing a blue vest hopped into her path. "Welcome to the Magical Forest," it said with a bow.'),
('story-2', 1, 'Detective Sarah Chen arrived at the museum as dawn was breaking over the city skyline.'),
('story-2', 2, 'The security guard, visibly shaken, led her to the empty display case where the Golden Scarab had been just hours before.'),
('story-3', 1, 'Commander Johnson was reviewing the morning reports when the proximity alarms began blaring throughout Space Station Alpha.'),
('story-3', 2, '"Unknown vessel approaching from sector 7," announced Lieutenant Torres from the navigation console.');

EOF

echo "✅ Local database created successfully!"
echo "📍 Database location: $DB_PATH"
echo ""

# Update the backend to use LocalDev environment for development
echo "🔧 Updating backend startup script for local development..."

# Update start-backend.sh to use LocalDev environment
sed -i '' 's/export ASPNETCORE_ENVIRONMENT=Development/export ASPNETCORE_ENVIRONMENT=LocalDev/' "$PROJECT_ROOT/scripts/start-backend.sh"

echo "✅ Backend configured for local development"
echo ""
echo "📊 Database Statistics:"
echo "   Story Types: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM StoryType;")"
echo "   Demo Stories: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM StoryData;")"
echo "   Story Pages: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM StoryPages;")"
echo ""
echo "🧪 Test Database:"
echo "   sqlite3 $DB_PATH"
echo "   sqlite3 $DB_PATH 'SELECT * FROM StoryType;'"
echo ""
echo "🚀 Start development environment:"
echo "   npm run dev"
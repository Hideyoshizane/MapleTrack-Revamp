-- CreateEnum
CREATE TYPE "SymbolCategory" AS ENUM ('arcane', 'sacred', 'grand');

-- CreateEnum
CREATE TYPE "BossReset" AS ENUM ('Daily', 'Weekly', 'Monthly');

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" UUID NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMPTZ(3),
    "refreshTokenExpiresAt" TIMESTAMPTZ(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" UUID NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "lastLogin" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMPTZ(3),
    "liberationLastUpdate" TIMESTAMPTZ(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "targetLevel" INTEGER NOT NULL,
    "class" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "legion" TEXT NOT NULL,
    "linkSkill" TEXT NOT NULL,
    "server" TEXT NOT NULL,
    "lastUpdate" TIMESTAMPTZ(3) NOT NULL,
    "lastSymbolDaily" TEXT,
    "bossing" BOOLEAN NOT NULL DEFAULT false,
    "syncing" BOOLEAN NOT NULL DEFAULT false,
    "userId" UUID NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSymbol" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "exp" INTEGER NOT NULL,
    "category" "SymbolCategory" NOT NULL,
    "characterId" UUID NOT NULL,

    CONSTRAINT "CharacterSymbol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterContent" (
    "id" UUID NOT NULL,
    "contentType" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "cleared" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMPTZ(3),
    "tries" INTEGER,
    "symbolId" UUID NOT NULL,

    CONSTRAINT "CharacterContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BossList" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "lastUpdateDaily" TIMESTAMPTZ(3),
    "lastUpdateWeekly" TIMESTAMPTZ(3),
    "lastUpdateMonthly" TIMESTAMPTZ(3),

    CONSTRAINT "BossList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BossServer" (
    "id" UUID NOT NULL,
    "serverName" TEXT NOT NULL,
    "weeklyBosses" INTEGER NOT NULL DEFAULT 0,
    "totalGains" INTEGER NOT NULL DEFAULT 0,
    "bossListId" UUID NOT NULL,

    CONSTRAINT "BossServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BossCharacter" (
    "id" UUID NOT NULL,
    "characterId" UUID NOT NULL,
    "serverId" UUID NOT NULL,

    CONSTRAINT "BossCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Boss" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "reset" "BossReset" NOT NULL,
    "partySize" INTEGER NOT NULL DEFAULT 1,
    "dailyTotal" INTEGER DEFAULT 1,
    "dailyCleared" INTEGER DEFAULT 0,
    "cleared" BOOLEAN NOT NULL DEFAULT false,
    "locked" BOOLEAN DEFAULT false,
    "bossCharacterId" UUID NOT NULL,

    CONSTRAINT "Boss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Liberation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "characterId" UUID NOT NULL,
    "server" TEXT NOT NULL,
    "currentGenesisQuest" TEXT NOT NULL,
    "currentGenesisPoints" INTEGER NOT NULL DEFAULT 0,
    "genesisPass" BOOLEAN NOT NULL DEFAULT false,
    "liberated" BOOLEAN NOT NULL DEFAULT false,
    "currentAstraQuest" TEXT NOT NULL,
    "currentAstraVestigesPoints" INTEGER NOT NULL DEFAULT 0,
    "currentAstraTracesPoints" INTEGER NOT NULL DEFAULT 0,
    "currentDestinyQuest" TEXT NOT NULL,
    "currentDestinyPoints" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Liberation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON "User"("resetPasswordToken");

-- CreateIndex
CREATE INDEX "User_resetPasswordExpires_idx" ON "User"("resetPasswordExpires");

-- CreateIndex
CREATE INDEX "Character_userId_name_idx" ON "Character"("userId", "name");

-- CreateIndex
CREATE INDEX "Character_server_idx" ON "Character"("server");

-- CreateIndex
CREATE UNIQUE INDEX "Character_userId_server_class_key" ON "Character"("userId", "server", "class");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSymbol_characterId_name_key" ON "CharacterSymbol"("characterId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterContent_symbolId_contentType_key" ON "CharacterContent"("symbolId", "contentType");

-- CreateIndex
CREATE UNIQUE INDEX "BossList_userId_key" ON "BossList"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BossCharacter_serverId_characterId_key" ON "BossCharacter"("serverId", "characterId");

-- CreateIndex
CREATE INDEX "Liberation_userId_idx" ON "Liberation"("userId");

-- CreateIndex
CREATE INDEX "Liberation_characterId_idx" ON "Liberation"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "Liberation_userId_characterId_key" ON "Liberation"("userId", "characterId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSymbol" ADD CONSTRAINT "CharacterSymbol_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterContent" ADD CONSTRAINT "CharacterContent_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "CharacterSymbol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BossList" ADD CONSTRAINT "BossList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BossServer" ADD CONSTRAINT "BossServer_bossListId_fkey" FOREIGN KEY ("bossListId") REFERENCES "BossList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BossCharacter" ADD CONSTRAINT "BossCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BossCharacter" ADD CONSTRAINT "BossCharacter_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "BossServer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boss" ADD CONSTRAINT "Boss_bossCharacterId_fkey" FOREIGN KEY ("bossCharacterId") REFERENCES "BossCharacter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liberation" ADD CONSTRAINT "Liberation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liberation" ADD CONSTRAINT "Liberation_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

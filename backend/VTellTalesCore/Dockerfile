# Multi-stage Dockerfile for VTellTales backend (.NET 8)

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files for restore
COPY backend/MyStoryBookCore/MyStoryBook.DTO/*.csproj backend/MyStoryBookCore/MyStoryBook.DTO/
COPY backend/MyStoryBookCore/MyStoryBook.DL/*.csproj backend/MyStoryBookCore/MyStoryBook.DL/
COPY backend/MyStoryBookCore/MyStoryBook.BL/*.csproj backend/MyStoryBookCore/MyStoryBook.BL/
COPY backend/MyStoryBookCore/MyStoryBook.API/MyStoryBook.API/*.csproj backend/MyStoryBookCore/MyStoryBook.API/MyStoryBook.API/

RUN dotnet restore \
  "/src/backend/MyStoryBookCore/MyStoryBook.API/MyStoryBook.API/MyStoryBook.API.csproj"

# Copy the rest of the source
COPY backend/MyStoryBookCore/ backend/MyStoryBookCore/

# Publish
RUN dotnet publish \
  "/src/backend/MyStoryBookCore/MyStoryBook.API/MyStoryBook.API/MyStoryBook.API.csproj" \
  -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Install curl for healthchecks (small footprint)
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

# Non-root runtime user
USER app

# Default port
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD curl -fsS http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "MyStoryBook.API.dll"]

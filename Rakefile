Rake.application.options.trace_rules = true
# -----------------------------------------------------------------------------
# Rakefile to help with the maintenance of the forked MoMA collection repo
# -----------------------------------------------------------------------------

# -----------------------------------------------------------------------------
# Globals
# -----------------------------------------------------------------------------
UPSTREAM_URL    = 'https://github.com/MuseumofModernArt/collection.git'
SQL_FILE_FORMAT = 'MoMA-collection.%s.sql'
DEFAULT_BRANCH  = 'main'
UPSTREAM_BRANCH = 'upstream'
REFERENCE_EXT   = 'json'

# -----------------------------------------------------------------------------
# Functions
# -----------------------------------------------------------------------------
def remote_branch
   return @remote_branch if @remote_branch
   @remote_branch = `git branch -r | grep -oE 'upstream/(main|master)'`.strip
end

def reference_time(file)
  File.stat(file).mtime
end

def release(target_file)
  source_file = Rake::FileList["*.#{REFERENCE_EXT}"].first
  begin
    release = Time.now.utc.strftime('%B %Y')
    if File.read(target_file) !~ %r{Release:\s+#{release}}
      touch target_file, :mtime => reference_time(source_file) - 86400
    end
    source_file
  rescue
    source_file
  end
end

# -----------------------------------------------------------------------------
# Tasks
# -----------------------------------------------------------------------------
task :default => 'postgresql:default'

# -----------------------------------------------------------------------------
# Rules
# -----------------------------------------------------------------------------
rule '.postgresql.sql' => ->(f) { release(f) } do |t|
   sh %(bin/convert2psql -o #{t.name})
   touch t.name, :mtime => reference_time(t.source)
end

# -----------------------------------------------------------------------------
# Namespaces
# -----------------------------------------------------------------------------
namespace :upstream do

  desc 'Setup upstream in git'
  task :setup do
    @upstream_url = `git config --get remote.upstream.url`.strip
    sh %(git remote add upstream #{UPSTREAM_URL}) \
      if @upstream_url.empty?
  end

  desc 'Fetch upstream changes from github'
  task :fetch => :setup do
    sh %(git fetch upstream --prune)
  end

  desc 'Create upstream branch if not existing'
  task :create_branch => :fetch do
    sh %(git branch | grep #{UPSTREAM_BRANCH} ||) +
       %(git branch #{UPSTREAM_BRANCH} #{remote_branch})
    sh %(git branch --set-upstream-to=#{remote_branch} #{UPSTREAM_BRANCH})
  end

  desc 'Sync upstream changes to local copy of (main|master)'
  task :sync => :fetch do
    sh %(git rebase #{remote_branch} #{UPSTREAM_BRANCH})
  end

  desc 'Rebase with default branch'
  task :rebase => :sync do
    sh %(git rebase #{UPSTREAM_BRANCH} #{DEFAULT_BRANCH})
  end

  task :default => :rebase
end

# -----------------------------------------------------------------------------

namespace :postgresql do
  file_name      = SQL_FILE_FORMAT % %w( postgresql )
  timestamp_file = 'Artworks.json'

  desc 'Switch to default branch'
  task :checkout_default_branch do
    sh %(git checkout #{DEFAULT_BRANCH})
  end

  desc 'Create commit with sql file'
  task :commit => file_name do
    puts file_name
    if `git status --short`.length > 0
      timestamp   = File.stat(file_name).mtime
      tag_date    = timestamp.strftime('%Y-%m')
      commit_date = timestamp.strftime('%B %-d. %Y')
      sh %(git add #{file_name})
      sh %(git commit -m "SQL: Postgres #{commit_date} updates" #{file_name})
      sh %(git tag sql-release-#{tag_date})
    end
  end

  task :default => [ 'upstream:default', :commit ]
end

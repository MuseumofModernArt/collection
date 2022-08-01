# -----------------------------------------------------------------------------
# Rakefile to help with the maintenance of the forked MoMA collection repo
# -----------------------------------------------------------------------------


# -----------------------------------------------------------------------------
# Globals
# -----------------------------------------------------------------------------
UPSTREAM_URL    = 'https://github.com/MuseumofModernArt/collection.git'
SQL_FILE_FORMAT = 'MoMA-collection.%s.sql'
DEFAULT_BRANCH  = 'postgresql'

# -----------------------------------------------------------------------------
# Tasks
# -----------------------------------------------------------------------------
task :default => 'postgresql:default'

# -----------------------------------------------------------------------------
# Namespaces
# -----------------------------------------------------------------------------
namespace :upstream do

  desc 'Setup upstream in git'
  task :setup do
    @upstream_url = `git config --get remote.upstream.url`.strip
    puts @upstream_url
    sh %(git remote add upstream #{UPSTREAM_URL}) \
      if @upstream_url.empty?
  end

  desc 'Fetch upstream changes from github'
  task :fetch => :setup do
    sh %(git fetch upstream --prune)
  end

  desc 'Sync upstream changes to local copy of (main|master)'
  task :sync => :fetch do
    @remote_branch = `git branch -r | grep -oE 'upstream/(main|master)'`.strip
    @local_branch  = @remote_branch.split('/').last
    sh %(git rebase #{@remote_branch} #{@local_branch})
  end
  
  desc 'Rebase with current branch'
  task :rebase => :sync do
    sh %(git checkout #{DEFAULT_BRANCH})  
    sh %(git rebase #{@local_branch})  
  end

  task :default => :rebase
end

# -----------------------------------------------------------------------------

namespace :postgresql do
  file_name = SQL_FILE_FORMAT % %w( postgresql )
  desc "Generate postgres SQL file"
  task :sql_file do
    sh %(bin/convert2psql -o #{file_name})
  end
  
  task :default => [ 'upstream:default', :sql_file ]
end

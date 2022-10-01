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

task :upstream => 'upstream:default'

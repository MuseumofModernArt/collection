namespace :setup do

  desc 'Install octokit and dependencies'
  task :install do
    if Gem.find_files('octokit').count == 0
      # installer goes here
    end
  end

  task :default => :install
end

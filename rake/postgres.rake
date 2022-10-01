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

require 'octokit'
require 'mime/types'

namespace :release do

  desc "Clean archive and checksum files"
  task :clean do
    rm Rake::FileList['*.gz*', '*.zip*'] 
  end 
  
  desc "Create archive and checksum files"
  task :create_archives do
    Rake::FileList['*.sql'].each do |sql_file|
      %w(gz zip).each do |ext|
        archive_file  = [sql_file, ext].join('.')
        checksum_file = [archive_file, 'sha256'].join('.')
        Rake::Task[archive_file].invoke
        Rake::Task[checksum_file].invoke
      end
    end
  end

  task :create_release => :create_archives do
    tag  = Time.now.utc.strftime('sql-release-%Y-%m')
    repo = 'uroesch/moma-collection'
    begin
      gh = Octokit::Client.new(access_token: ENV['GITHUB_TOKEN'])
      gh.user.login
      release = gh.release_for_tag(repo, tag)
      release = gh.create_release(repo, tag) unless release
      url     = release['url']
      Rake::FileList['*.gz*', '*.zip*'].each do |file|
        type = MIME::Types.type_for(file).first || MIME::Types['text/plain']
        gh.upload_asset(url, file, content_type: type.to_s)
      end 
    rescue => e
      puts e.message
    end
  end

  task :default => [ 'setup:default', :create_release]
end

task :release => 'release:default'

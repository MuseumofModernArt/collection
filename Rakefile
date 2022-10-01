# -----------------------------------------------------------------------------
# Rakefile to help with the maintenance of the forked MoMA collection repo
# -----------------------------------------------------------------------------
require 'digest'

# -----------------------------------------------------------------------------
# Globals
# -----------------------------------------------------------------------------
UPSTREAM_URL    = 'https://github.com/MuseumofModernArt/collection.git'
SQL_FILE_FORMAT = 'MoMA-collection.%s.sql'
DEFAULT_BRANCH  = 'main'
UPSTREAM_BRANCH = 'upstream'
REFERENCE_EXT   = 'json'

# -----------------------------------------------------------------------------
# Setup
# -----------------------------------------------------------------------------
Rake.application.options.trace_rules = true
Rake::FileList['rake/*.rake'].each { |rake| load rake }

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

rule '.sql.zip' => '.sql' do |t|
  sh %(7z a #{t.name} #{t.source} >/dev/null)
end

rule '.sql.gz' => '.sql' do |t|
  sh %(gzip -c -9 #{t.source} > #{t.name})
end

rule '.sha256' => ->(f) { f.ext } do |t|
  File.write(t.name, Digest::SHA256.file(t.source).hexdigest + "\n")
end

#puts ARGV.inspect

require "json"
require "base64"

if ARGV[0].start_with?("http://") or ARGV[0].start_with?("https://")
  exit 0;
end

base=ARGV[0].split('/').first


docker_config_json = JSON.parse(IO.read("#{ENV["HOME"]}/.docker/config.json"))

out = { "auths" => { } }

keys = docker_config_json['auths'].keys.select{|i| i.include?(base) }
if keys.nil? or keys.empty?
  exit 6
end

keys.inject(out['auths']) do |memo, key|
  memo[key] = docker_config_json['auths'][key]
  memo
end

puts Base64.strict_encode64(JSON.generate(out))
exit 0

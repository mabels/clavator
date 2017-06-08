
begin
  require 'pry'
rescue LoadError
end

CONSTRUQT_PATH = ENV['CONSTRUQT_PATH'] || '../../'
[
  "#{CONSTRUQT_PATH}/ipaddress/ruby/lib",
  "#{CONSTRUQT_PATH}/construqt/core/lib",
  "#{CONSTRUQT_PATH}/construqt/flavours/plantuml/lib",
  "#{CONSTRUQT_PATH}/construqt/flavours/gojs/lib",
  "#{CONSTRUQT_PATH}/construqt/flavours/nixian/core/lib",
  "#{CONSTRUQT_PATH}/construqt/flavours/nixian/dialects/ubuntu/lib",
  "#{CONSTRUQT_PATH}/construqt/flavours/nixian/dialects/coreos/lib",
  "#{CONSTRUQT_PATH}/construqt/flavours/nixian/dialects/arch/lib",
  "#{CONSTRUQT_PATH}/construqt/flavours/nixian/dialects/docker/lib",
  "#{CONSTRUQT_PATH}/construqt/flavours/nixian/services/lib",
  "#{CONSTRUQT_PATH}/construqt/flavours/nixian/tastes/entities/lib",
  "#{CONSTRUQT_PATH}/construqt/flavours/nixian/tastes/systemd/lib",
  "#{CONSTRUQT_PATH}/construqt/flavours/nixian/tastes/flat/lib",
  "#{CONSTRUQT_PATH}/construqt/flavours/nixian/tastes/debian/lib",
  "#{CONSTRUQT_PATH}/construqt/flavours/nixian/tastes/file/lib",
  "#{CONSTRUQT_PATH}/construqt/flavours/mikrotik/lib",
  "#{CONSTRUQT_PATH}/construqt/flavours/ciscian/core/lib",
  "#{CONSTRUQT_PATH}/construqt/flavours/ciscian/dialects/hp/lib",
  "#{CONSTRUQT_PATH}/construqt/flavours/unknown/lib"
].each { |path| $LOAD_PATH.unshift(path) }
require 'rubygems'
require 'construqt'
require 'construqt/flavour/nixian'
require 'construqt/flavour/nixian/dialect/arch'
require 'construqt/flavour/nixian/dialect/coreos'
require 'construqt/flavour/nixian/dialect/docker'
require 'construqt/flavour/nixian/dialect/ubuntu'

server_device=ARGV[0]||"enp0s8"
arch=ARGV[1]||"x86_64"
node_version=ARGV[2]||"c108871"
gnupg_version=ARGV[3]||"eaf5bb30e"

[
 'clavator.rb'
].each do |f|
  require_relative f
end


def setup_region(name, network)
  region = Construqt::Regions.add(name, network)
  nixian = Construqt::Flavour::Nixian::Factory.new
  nixian.services_factory.add(Clavator::Factory.new)
  nixian.add_dialect(Construqt::Flavour::Nixian::Dialect::Arch::Factory.new)
  nixian.add_dialect(Construqt::Flavour::Nixian::Dialect::Docker::Factory.new)
  nixian.add_dialect(Construqt::Flavour::Nixian::Dialect::CoreOs::Factory.new)
  nixian.add_dialect(Construqt::Flavour::Nixian::Dialect::Ubuntu::Factory.new)
  region.flavour_factory.add(nixian)
  if ARGV.include?('plantuml')
    require 'construqt/flavour/plantuml.rb'
    region.add_aspect(Construqt::Flavour::Plantuml.new)
  end

  region.network.ntp.add_server(region.network.addresses.add_ip('5.9.110.236').add_ip('178.23.124.2')).timezone('MET')
  region.users.add('menabe', 'group' => 'admin', 'full_name' => 'Meno Abels', 'public_key' => <<KEY, 'email' => 'meno.abels@clavator.net')
    ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDIQpC2scaVXEaNuwtq4n6Vtht2WHYxtDFKe44JNFEsZGyQjyL9c2qkmQQGCF+2g3HrIPDTCCCWQ3GUiXGAlQ0/rf6sLqcm4YMXt+hgHU5VeciUIDEySCKdCPC419wFPBw6oKdcN1pLoIdWoF4LRDcjcrKKAlkdNJ/oLnl716piLdchABO9NXGxBpkLsJGK8qw390O1ZqZMe9wEAL9l/A1/49v8LfzELp0/fhSmiXphTVI/zNVIp/QIytXzRg74xcYpBjHk1TQZHuz/HYYsWwccnu7vYaTDX0CCoAyEt599f9u+JQ4oW0qyLO0ie7YcmR6nGEW4DMsPcfdqqo2VyYy4ix3U5RI2JcObfP0snYwPtAdVeeeReXi3c/E7bGLeCcwdFeFBfHSA9PDGxWVlxh/oCJaE7kP7eBhXNjN05FodVdNczKI5T9etfQ9VHILFrvpEREg1+OTiI58RmwjxS5ThloqXvr/nZzhIwTsED0KNW8wE4pjyotDJ8jaW2d7oVIMdWqE2M9Z1sLqDDdhHdVMFxk6Hl2XfqeqO2Jnst7qzbHAN/S3hvSwysixWJEcLDVG+cg1KRwz4qafCU5oHSp8aNNOk4RZozboFjac17nOmfPfnjC/LLayjSkEBZ+eFi+njZRLDN92k3PvHYFEB3USbHYzICsuDcf+L4cslX03g7w== openpgp:0x5F1BE34D
KEY

  region.users.add('ingben', 'group' => 'admin', 'full_name' => 'Ingo Bente', 'public_key' => <<KEY, 'email' => 'ingo.bente@clavator.net')
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC38kd1Db9ahEcI6zjEAFM+U94ODXKLrzmdeMQJK4jdWtv0mLZL4diogWVTUxq7fqNkdMShYO05WyJ62x/gLI1O4rk7m/7EpNBspTl0ePc10Y/c/ILFKNtyiTUK4Jodb+8cmzJvo4Uxaw5DowUr0ISBSIjcdBNq8X8tRkcFFshsxT1m0OIDmlVarEuQMfq1LxKvorKeEtj0J9DcGFcDgQ7D0xARBrVh71z3PfbCMqLe/jE+bNIJ3zLeoOIYmYQYdInIImZcF/w1pbiqBjvPg3On4M7aOR7oC1ujBLEaGRjfHbKU8aJhRYehXiellEvkBSVb6dF8RkWm1+j/YdVBwm4/9mmLxgl+tekjMveChCYt+Bwlo6l58RWu9jPhvuTvcteBpHZt/GslpSgWHckj2H/qOSYsjNx9aKdNRu0yWL94B7NowEU0XE17/n6F3WmkwB5edHEgm+rF0+mhG07ygeQhmo3zNFGmhuhebHxhRblDsyEOHAGNzfAfrcrRcYBU+EQ35LNAfdJR/E6CKm8OirezJqoQvBKKplFBj+bYVvOCZuoz/c2hyf7ZLWECoH4mAyl8hbrazAxPtHmNcXLc8l4yUoDvROwuFU/pJTNsET/1HIvalu8dH6jw3ufAe0RabzCbth/LiwqxRt6GlkEP7b0SbfMMZJfNm967ELnNNwARHw== openpgp:0xE360A3E4
KEY

  region
end

network = Construqt::Networks.add('clavator')
network.set_domain("clavator.net")
network.set_contact("net@clavator.net")
network.set_dns_resolver(network.addresses.set_name('NAMESERVER')
  .add_ip('8.8.8.8')
  .add_ip('8.8.4.4')
  .add_ip('2001:4860:4860::8888')
  .add_ip('2001:4860:4860::8844'),["clavator.net"])
region = setup_region('clavator', network)
#region.services.add(Dns::Service.new('DNS', nss))

#firewall(region)
clavator = region.hosts.add("clavator", "flavour" => "nixian", "dialect" => "arch",
                 "services" => [Construqt::Flavour::Nixian::Services::Vagrant::Service.new.box("bugyt/archlinux")
                                    .add_cfg('config.vm.network "public_network", bridge: "bridge0"')]) do |host|
  region.interfaces.add_device(host, "lo", "mtu" => "9000", :description=>"#{host.name} lo",
    "address" => region.network.addresses.add_ip(Construqt::Addresses::LOOOPBACK))
  host.configip = host.id ||= Construqt::HostId.create do |my|
    my.interfaces << region.interfaces.add_device(host, server_device, "mtu" => 1500,
      'address' => region.network.addresses.add_ip("192.168.16.1/24", "dhcp" =>
              Construqt::Dhcp.new
                .start("192.168.16.100")
                .end("192.168.16.200")
                .domain("clavator.com"))
              .add_ip("fd00:c0a8:1001::/64")
              .add_ip(Construqt::Addresses::DHCPV4))
  end
  region.interfaces.add_bridge(host, "docker0", "mtu" => 1500,
                              "interfaces" => [],
                              "startup" => false)
end

updowner = Construqt::Flavour::Nixian::Services::UpDowner::Service.new
                                .taste(Construqt::Flavour::Nixian::Tastes::File::Factory.new)

region.hosts.add('app', "flavour" => "nixian",
                        "dialect" => "docker",
                        "mother" => clavator,
                        "services" => [updowner,
  Construqt::Flavour::Nixian::Services::Invocation::Service.new(
    Construqt::Flavour::Nixian::Services::Docker::SimpleContainer.new
                  .container_name("clavator-docker-#{arch}-#{node_version}-#{gnupg_version}")
                  .privileged
                  .publish(80).publish(443))
                        ]) do |host|
  host.configip = host.id ||= Construqt::HostId.create do |my|
    my.interfaces << iface = region.interfaces.add_device(host, "bridge",
       "plug_in" => Construqt::Cables::Plugin.new.iface(clavator.interfaces.find_by_name("docker0")))
  end
end

Construqt.produce(region)

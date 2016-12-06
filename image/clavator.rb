
module Clavator
  class Service
    def initialize
    end
  end

  class Action
    def activate(context)
      @context = context
    end

    def attach_host(host)
      @host = host
    end

    def post_interfaces
      up_downer = @context.find_instances_from_type(Construqt::Flavour::Nixian::Services::UpDowner::OncePerHost)
      up_downer.add(@host, Taste::Entity.new())
    end
  end

  module Taste
    class Entity
    end

    class Systemd
      def on_add(ud, taste, iface, me)
        ess = @context.find_instances_from_type(Construqt::Flavour::Nixian::Services::EtcSystemdService::OncePerHost)
        ess.get("construqt-clavator.service") do |srv|
          # binding.pry
          srv.description("starts clavator")
            .type("simple")
            .after("multi-user.target")
            .wants("multi-user.target")
            .exec_start("cd /root/clavator && npn start")
            .wanted_by("multi-user.target")
        end
      end

      def activate(ctx)
        @context = ctx
        self
      end
    end
  end

  class Factory
    attr_reader :machine
    def start(service_factory)
      @machine ||= service_factory.machine
        .service_type(Service)
        .activator(Construqt::Flavour::Nixian::Services::UpDowner::Activator.new
        .entity(Taste::Entity)
        .add(Construqt::Flavour::Nixian::Tastes::Systemd::Factory, Taste::Systemd))
    end

    def produce(host, srv_inst, ret)
      Action.new
    end
  end
end

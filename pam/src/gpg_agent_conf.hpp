#ifndef __GPG_AGENT_CONF__
#define __GPG_AGENT_CONF__


#include <fstream>
#include <map>
#include <memory>

#include <boost/algorithm/string.hpp>
#include <boost/algorithm/string/classification.hpp>
#include <boost/algorithm/string/split.hpp>

class GpgAgentConf {
public:
  class Line {
  public:
    enum LoadedOrChanged { Loaded, Changed };

  private:
    std::string key;
    std::string value;
    LoadedOrChanged loadedOrChanged;

  public:
    Line(const std::string &key, const std::string &value)
        : key(key), value(value), loadedOrChanged(Changed) {}
    Line(const std::string &key, const std::string &value,
         LoadedOrChanged loadedOrChanged)
        : key(key), value(value), loadedOrChanged(loadedOrChanged) {}

    bool isLoaded() const { return loadedOrChanged == Loaded; }

    void setValue(const std::string &_value) {
      loadedOrChanged = Changed;
      value = _value;
    }

    const std::string& getKey() const { return key; }
    const std::string& getValue() const { return value; }

    std::string asString() const {
      std::stringstream d;
      d << key;
      if (!value.empty()) {
        d << " " << value;
      }
      d << std::endl;
      return d.str();
    }

    std::string dump() const {
      std::stringstream d;
      d << "[" << key << "][" << value << "]";
      return d.str();
    }
  };

private:
  const std::string fname;
  std::vector<std::shared_ptr<Line> > lines;
  std::map<std::string, std::vector<std::shared_ptr<Line>>> keys;
  const std::vector<std::shared_ptr<Line>> emptyKeys;

public:
  GpgAgentConf(const char *fname) : fname(fname) {}

  const std::vector<std::shared_ptr<Line>>& add(const Line &line) {
    auto spLine = std::shared_ptr<Line>(new Line(line));
    lines.push_back(spLine);
    auto found = keys.find(line.getKey());
    if (found == keys.end()) {
      found = keys.insert(
          keys.end(),
          std::make_pair(line.getKey(), std::vector<std::shared_ptr<Line>>()));
    }
    // D((spLine->getKey().c_str()));
    // D((spLine->getValue().c_str()));
    found->second.push_back(spLine);
    {
      std::stringstream s2;
      s2 << "addLine:" << spLine->dump() << ":"
        << found->second.empty() << ":" << found->second.size();
      //LOG(INFO) << s2;
    }
    return found->second;
  }

public:
  const std::vector<std::shared_ptr<Line>> &get() const { return lines; }

  const std::vector<std::shared_ptr<Line>>& getByKey(const std::string &key) {
    auto found = keys.find(key);
    if (found != keys.end()) {
      return found->second;
    }
    return emptyKeys;
  }
  const std::vector<std::shared_ptr<Line>>& updateLine(const Line &line) {
    auto found = keys.find(line.getKey());
    if (found != keys.end()) {
      if (!found->second.empty() && found->second.back()->getValue() == line.getValue()) {
        return found->second;
      }
      //D((line.getKey().c_str()));
      lines.erase(std::remove_if(
        lines.begin(), lines.end(),
        [&line](const std::shared_ptr<Line> &i){
          // D((i->getKey().c_str()));
          return i->getKey() == line.getKey();
        }),
        lines.end());
      keys.erase(line.getKey());
    }
    return add(line);
  }

  bool write() const {
    bool foundChanged = false;
    std::stringstream out;
    for (auto &line : lines) {
      foundChanged = foundChanged || !line->isLoaded();
      out << line->asString();
    }
    if (foundChanged) {
      if (boost::filesystem::exists(fname)) {
        std::string savFname(fname);
        savFname += ".sav";
        boost::filesystem::path sav(savFname);
        boost::filesystem::path orig(fname);
        boost::filesystem::remove(savFname);
        boost::filesystem::rename(orig, savFname);
      }
      std::ofstream outFile;
      outFile.open(fname);
      boost::filesystem::permissions(boost::filesystem::path(fname),
        boost::filesystem::owner_write|boost::filesystem::owner_read);
      outFile << out.rdbuf();
      outFile.close();
    }
    return foundChanged;
  }

  static GpgAgentConf read(const char *fname) {
    GpgAgentConf ret(fname);
    std::ifstream fstream(fname, std::ios_base::in | std::ios_base::binary);
    for (std::string str; std::getline(fstream, str);) {
      str = trim(str);
      if (str.empty()) {
        ret.add(Line("", "", Line::Changed));
        continue;
      }
      if (boost::starts_with(str, "#")) {
        ret.add(Line("#", str.substr(1), Line::Changed));
        continue;
      }
      auto split_idx = str.find_first_of("\t ");
      if (std::string::npos != split_idx) {
        ret.add(Line(str.substr(0, split_idx),
                       trim(str.substr(split_idx + 1)), Line::Changed));
      } else {
        ret.add(Line(str, "", Line::Changed));
      }
    }
    fstream.close();
    return ret;
  }
};

#endif

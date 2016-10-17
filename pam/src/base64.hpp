#ifndef __BASE64__
#define __BASE64__

#include <string>

#include <boost/archive/iterators/base64_from_binary.hpp>
#include <boost/archive/iterators/binary_from_base64.hpp>
#include <boost/archive/iterators/insert_linebreaks.hpp>
#include <boost/archive/iterators/transform_width.hpp>
#include <boost/archive/iterators/ostream_iterator.hpp>

namespace Base64 {
  std::string decode(const std::string &val) {
    using namespace boost::archive::iterators;
    using It = transform_width<binary_from_base64<std::string::const_iterator>, 8, 6>;
    return boost::algorithm::trim_right_copy_if(
        std::string(It(std::begin(val)), It(std::end(val))), [](char c) {
          return c == '\0';
        });
  }

  std::string encode(const std::string &text) {
    const std::string base64_padding[] = {"", "==", "="};
    using namespace boost::archive::iterators;
    typedef std::string::const_iterator iterator_type;
    typedef base64_from_binary<transform_width<iterator_type, 6, 8> > base64_enc;
    std::stringstream ss;
    std::copy(base64_enc(text.begin()), base64_enc(text.end()), ostream_iterator<char>(ss));
    ss << base64_padding[text.size() % 3];
    return ss.str();
  }
}
#endif

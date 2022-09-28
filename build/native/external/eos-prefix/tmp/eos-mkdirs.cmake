# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION 3.5)

file(MAKE_DIRECTORY
  "/Users/chenke/code/eos/EdenCN/external/eos"
  "/Users/chenke/code/eos/EdenCN/build/native/external/eos"
  "/Users/chenke/code/eos/EdenCN/build/native/external/eos-prefix"
  "/Users/chenke/code/eos/EdenCN/build/native/external/eos-prefix/tmp"
  "/Users/chenke/code/eos/EdenCN/build/native/external/eos-prefix/src/eos-stamp"
  "/Users/chenke/code/eos/EdenCN/build/native/external/eos-prefix/src"
  "/Users/chenke/code/eos/EdenCN/build/native/external/eos-prefix/src/eos-stamp"
)

set(configSubDirs )
foreach(subDir IN LISTS configSubDirs)
    file(MAKE_DIRECTORY "/Users/chenke/code/eos/EdenCN/build/native/external/eos-prefix/src/eos-stamp/${subDir}")
endforeach()

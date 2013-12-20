
set zip=h:\data\tri\temp\tri-devp-pkg
set zipn=h:\data\tri\temp\tri-devp-pkg-node


rem goto node

rem GAE Variant
del %ZIP%.zip
pushd
cd h:\data\tri
wzzip -r -P -x@src\4nt\trizipx.txt  %ZIP%.zip war\* icons\* data\* bats\* lib\*
popd

pushd
cd h:\data\tri\variants\gae
wzzip -r -P %ZIP%.zip war\*
popd

pushd
cd h:\data\tri\variants\node
wzzip -r -P %ZIP%.zip war\* bats\*
popd

:node
rem NODE.JS Variant
del %ZIPN%.zip
pushd
cd h:\data\tri
wzzip -r -P -x@src\4nt\trizipx.txt -x@src\4nt\trizipxn.txt  %ZIPN%.zip war\* icons\* data\* bats\*
popd

pushd
cd h:\data\tri\variants\node
wzzip -r -P %ZIPN%.zip war\* bats\*
popd
pushd

copy %ZIP%.zip h:\data\tri\war\zips\tri-devp-pkg.bin
copy %ZIPN%.zip h:\data\tri\war\zips\tri-devp-pkg-node.bin



set   zip=h:\data\tri\lib\waks

del %ZIP%.jar
pushd
cd h:\data\e35-rsi\chbooks\gen\cls
pkzip25 -add -rec -path=relative %ZIP%.zip waks*.class

cd h:\data\e35-acs\sbu\gen\cls
pkzip25 -add -rec -path=relative %ZIP%.zip *.class
popd

ren %ZIP%.zip %ZIP%.jar

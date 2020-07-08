rem A convenience batch file for installing nodejs module dependencies required to run
rem Because this is a batch file, you should use `call install-run-dependencies.bat` to allow your calling script to continue

set old_dir=%CD%
set this_dir=%~dp0

cd %this_dir%

rem restore statesmith nodejs module dependencies required to run. `call` required for `npm` see https://github.com/npm/npm/issues/2938.
call npm install --production

cd %old_dir%

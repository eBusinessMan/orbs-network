 #!/usr/bin/env bash -e 

node simulate/src/index.js transaction-gossip  &
sleep 20
cd e2e && npm test

exit $?
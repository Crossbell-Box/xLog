set -e  # exit on error
set -x  # show command before execute

apply_one() {
        envsubst < $1 > temp.yaml && mv temp.yaml $1

        kubectl apply -f $1
}

apply() {
        for filename in $@; do
                apply_one $filename
        done

        # rollout status / annotation
        for filename in $@; do
                yaml_kind=$(yq '.kind' $filename)
                if [ "$yaml_kind" = "Deployment" ]; then
                        ns=$(yq '.metadata.namespace' $filename)
                        name=$(yq '.metadata.name' $filename)
                        kubectl -n $ns rollout status -w deploy.apps/$name
                fi
        done
}

apply $@

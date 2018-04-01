<?php

namespace App\Http\Controllers;

use App\Helpers\ApiErrorResponse;
use App\Http\Resources\NodeResource;
use App\Http\Resources\NodesResource;
use App\Node;
use App\Repositories\ClientRepository;
use App\Repositories\NodeRepository;
use App\Repositories\ProjectRepository;
use Illuminate\Http\Request;

class NodeController extends Controller
{
    /** @var NodeRepository */
    private $nodes;

    /** @var ProjectRepository */
    private $projects;

    /** @var ClientRepository */
    private $clients;


    /**
     * NodeController constructor.
     * @param NodeRepository $nodes
     * @param ProjectRepository $projects
     * @param ClientRepository $clients
     */
    public function __construct(NodeRepository $nodes, ProjectRepository $projects, ClientRepository $clients)
    {
        $this->middleware('jwt.auth');
        NodeResource::withoutWrapping();
        $this->nodes = $nodes;
        $this->projects = $projects;
        $this->clients = $clients;
    }


    /**
     * Display a listing of the resource.
     *
     * @return NodesResource
     */
    public function index()
    {
        return new NodesResource($this->nodes->paginateAllWithProject());
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        if ((!$request->name)) {
            $this->addError(new ApiErrorResponse(422, 'Bad attribute', 'Name attribute was not recognized.', 422));
        }

        if ((!$request->eui)) {
            $this->addError(new ApiErrorResponse(422, 'Bad attribute', 'EUI attribute was not recognized.', 422));
        }

        if ((!$request->project_id)) {
            $this->addError(new ApiErrorResponse(422, 'Bad attribute', 'Project ID attribute was not recognized.', 422));
        }

        if ($this->hasError()) {
            return $this->responseApiErrors();
        }

        if (!$this->isProjectAvailable($request->project_id)) {
            $this->addError(new ApiErrorResponse(422, 'Bad attribute', 'Bad project was selected.', 422));
            return $this->responseApiErrors();
        }

        $node = new Node([
            'eui' => trim($request->eui),
            'name' => trim($request->name),
            'project_id' => $request->project_id,
        ]);
        $node->save();

        return (new NodeResource($node))->response()->setStatusCode(201);
    }


    /**
     * @param int $projectId
     * @return bool
     */
    private function isProjectAvailable(int $projectId)
    {
        $project = $this->projects->findById($projectId);
        if (!$project) {
            return false;
        }

        //TODO: check for current user

        return true;
    }


    /**
     * Display the specified resource.
     *
     * @param int $nodeId
     * @return NodeResource|\Illuminate\Http\JsonResponse
     */
    public function show(int $nodeId)
    {
        if ($nodeId) {
            $node = $this->nodes->findById($nodeId);

            if ($node) {
                return new NodeResource($node);
            }
        }

        $this->addError(new ApiErrorResponse(404, 'Not found', 'Node was not found', 404));

        return $this->responseApiErrors();
    }


    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param int $nodeId
     * @return NodeResource|\Illuminate\Http\Response
     */
    public function update(Request $request, int $nodeId)
    {
        if ((!$request->name)) {
            $this->addError(new ApiErrorResponse(422, 'Bad attribute', 'Correct name attribute was not recognized.', 422));
        }

        if ((!$request->eui)) {
            $this->addError(new ApiErrorResponse(422, 'Bad attribute', 'Correct EUI attribute was not recognized.', 422));
        }

        if ((!$request->project_id)) {
            $this->addError(new ApiErrorResponse(422, 'Bad attribute', 'Correct project ID attribute was not recognized.', 422));
        }

        if (!$this->isProjectAvailable($request->project_id)) {
            $this->addError(new ApiErrorResponse(422, 'Bad attribute', 'Correct project ID attribute was not recognized.', 422));
        }

        if (!$nodeId) {
            $this->addError(new ApiErrorResponse(404, 'Not found', 'Node was not found', 404));
        }

        if ($this->hasError()) {
            return $this->responseApiErrors();
        }

        $node = $this->nodes->findById($nodeId);

        if (!$node) {
            $this->addError(new ApiErrorResponse(404, 'Not found', 'Node was not found', 404));

            return $this->responseApiErrors();
        }

        $node->eui = trim($request->eui);
        $node->name = trim($request->name);
        $node->project_id = $request->project_id;
        $node->save();

        return new NodeResource($node);
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param int $nodeId
     * @return \Illuminate\Http\Response
     */
    public function destroy(int $nodeId)
    {
        if ($nodeId) {
            $node = $this->nodes->findById($nodeId);

            if ($node) {
                $node->delete();

                return response(null, 204);
            }
        }

        $this->addError(new ApiErrorResponse(404, 'Not found', 'Node was not found', 404));

        return $this->responseApiErrors();
    }
}

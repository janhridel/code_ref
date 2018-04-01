<?php

namespace App\Http\Controllers;

use App\Page;
use App\Repositories\PackageRepository;
use App\Repositories\PageRepository;
use Illuminate\Http\Request;

class PageController extends Controller
{
    /** @var  PageRepository */
    private $pages;

    /** @var  PackageRepository */
    private $packages;


    /**
     * PageController constructor.
     * @param PageRepository $pages
     * @param PackageRepository $packages
     */
    public function __construct(PageRepository $pages, PackageRepository $packages)
    {
        $this->pages = $pages;
        $this->packages = $packages;
    }


    public function show(Page $page)
    {
        $packagesIds = $this->packages->upcoming(date('Y-m-d'));
        $ids = [];
        foreach ($packagesIds as $packages_id) {
            $ids[] = $packages_id->id;
        }
        $upcomingPackages = $this->packages->allByIds($ids);
        return view('home.index', compact('page', 'upcomingPackages'));
    }


}

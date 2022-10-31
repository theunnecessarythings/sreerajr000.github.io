---
layout: default
title: Posts
permalink: /posts
---
<!-- Posts Index
================================================== -->
<section class="recent-posts">

    <div class="section-title">

        <h2><span>All Posts</span></h2>

    </div>

    <div class="row listrecent">

        {% for post in site.categories["Posts"] %}

        {% include postbox.html %}

        {% endfor %}

    </div>

</section>
